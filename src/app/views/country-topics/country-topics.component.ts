import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, NavigationEnd,ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SlugifyPipe } from '../../services/slugify.pipe';
import { Language, MessageException, MessageError, Country, CountryTopic, CountryTopicLanguage } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
interface FormData {
  'id': string;
  'lang': string;
  'title': string[];
  'text': string[];
}

@Component({
  selector: 'app-country-topics',
  templateUrl: './country-topics.component.html',
  styleUrls: ['./country-topics.component.css']
})

export class CountryTopicsComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  formData: Array<FormData>;
  currentLanguage: string;
  languages: Array<Language>;
  country: Country;
  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  topicCounterDelete: number;
  topicIdDelete: string;
  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: MessageError;
  errorsDescriptions: string[];
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  constructor (
    private router: Router,
    private _Activatedroute:ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService,
    private slugifyPipe: SlugifyPipe,
    private SpinnerService: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.currentLanguage = this.translate.getDefaultLang();
    this.languages = environment.languages;
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
    this.errorsDescriptions = [];
    this.formData = [];
    this.country = {
      idCountry: '',
      identifier: '',
      completed: false
    }

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  // Page init
  ngOnInit(): void {
    this.getCountry();
  }

  currentRouter = this.router.url;

  // Get country details
  async getCountry() {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Get the country information
    this.http.get<Country>(environment.apiUrl + environment.apiPort + "/countries/" + this.uuid, {headers} )
    .subscribe(dataCountry=> {
      this.country = dataCountry;

      // Get related topics
      this.getCountryTopics();
      this.SpinnerService.hide();
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Get country topics
  async getCountryTopics() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Filters
    let filter = ' \
      { \
        "where": { \
          "idCountry" : "' + this.country.idCountry + '" \
        }, \
        "fields": { \
          "idCountry" : true, \
          "identifier" : true, \
          "idCountryTopic" : true \
        }, \
        "offset":0, \
        "skip":0, \
        "order":["identifier"] \
      }';

    this.http.get<Array<CountryTopic>>(environment.apiUrl + environment.apiPort + "/countries-topics?filter=" + filter, {headers} )
    .subscribe(dataTopics=> {
      //For each topic get the related information
      dataTopics.forEach(currentTopic => {
        let topic:FormData = {
          'id': currentTopic.idCountryTopic,
          'lang': this.currentLanguage,
          'title': [],
          'text': []
        };

        //Get the language information for the current topic
        this.http.get<Array<CountryTopicLanguage>>(environment.apiUrl + environment.apiPort + "/countries-topics/" + currentTopic.idCountryTopic + '/countries-topics-languages', {headers} )
        .subscribe(dataTopicLangs => {
          dataTopicLangs.forEach(dataLang => {
            topic.title[dataLang.language] = dataLang.topic;
            topic.text[dataLang.language] = dataLang.description;
          });
        }, error => {
          this.showExceptionMessage(error);
        });

        this.formData.push(topic);
      });

      //Check if languages are empties
      if (dataTopics.length == 0) {
        this.addEmptyTopic();
      }
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Add empty topic
  async addEmptyTopic() {
    let emptyTopic:FormData = {
      'id':'',
      'lang': this.currentLanguage,
      'title':[],
      'text':[]
    };

    this.languages.forEach(elementLang => {
      emptyTopic.id = '';
      emptyTopic.title[elementLang.value] = '';
      emptyTopic.text[elementLang.value] = '';
    });

    this.formData.push(emptyTopic);
  }

  // Save Topic
  async saveTopic() {
    this.SpinnerService.show();
    this.errorsDescriptions = [];

    if (this.formData) {
      //Check if entered information in each language
      let validate = 1;
      this.formData.forEach(topic => {
        this.languages.forEach(element => {
          if (!topic.title[element.value]) {
            validate = 0;
          }
          if (!topic.text[element.value]) {
            validate = 0;
          }
        });
      });

      if (validate == 0) {
        this.errorsDescriptions.push(this.translate.instant('Please, enter title and description in each language'));
        this.SpinnerService.hide();
      }

      //Check if there are no errors
      if (this.errorsDescriptions.length === 0) {
        //Data save
        let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

        this.formData.forEach(element => {
          let postParams = {
            idCountry: this.uuid,
            identifier: this.slugifyPipe.transform(element.title['en']),
          };

          //Check if update or insert
          if (element.id) {
            //Update the topic
            this.http.patch(environment.apiUrl + environment.apiPort + "/countries-topics/" + element.id, postParams, {headers} )
            .subscribe(async data => {
              await this.saveTopicLanguages(element);
              this.SpinnerService.hide();
            }, error => {
              this.SpinnerService.hide();
              this.showExceptionMessage(error);
            });
          } else {
            this.http.post<CountryTopic>(environment.apiUrl + environment.apiPort + "/countries-topics", postParams, {headers} )
            .subscribe(async data => {
              element.id = data.idCountryTopic;

              await this.saveTopicLanguages(element);
              this.SpinnerService.hide();
            }, error => {
              this.SpinnerService.hide();
              this.showExceptionMessage(error);
            });
          }
        });

        await this.modalInfo.show();
      } else {
        this.SpinnerService.hide();
        //Missing data
        this.showErrorMessage(
          this.translate.instant('Missing data'),
          this.translate.instant('The data entered is incorrect or missing.')
        );
      }
    }
  }

  // Save topic language
  saveTopicLanguages(element) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    //Update the topic language
    this.languages.forEach(elementLang => {
      let subpostParams = {
        idCountryTopic: element.id,
        topic: element.title[elementLang.value],
        description: element.text[elementLang.value],
        language: elementLang.value,
      };

      this.http.post(environment.apiUrl + environment.apiPort + "/countries-topics-languages", subpostParams, {headers} )
      .subscribe(dataLang => {
      }, error => {
        this.showExceptionMessage(error);
      });
    });
  }

  // Switch language
  async switchTextarea(lang, counter) {
    this.formData[counter].lang = lang;
  }

  // Delete topic
  deleteTopic() {
    this.SpinnerService.show();
    if (!this.topicIdDelete) {
      this.formData.splice(this.topicCounterDelete, 1);
      this.SpinnerService.hide();
    } else {
      let headers = new HttpHeaders().set("Authorization", "Bearer "+this.token);

      this.http.delete(environment.apiUrl + environment.apiPort + "/countries-topics/" + this.topicIdDelete, {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();
        this.formData.splice(this.topicCounterDelete, 1);
      }, error => {
        this.SpinnerService.hide();
        this.showExceptionMessage(error);
      });
    }
    this.modalDelete.hide();
  }

  // Delete message
  showDeleteMessage(counter, id) {
    this.topicCounterDelete = counter;
    this.topicIdDelete = id;
    if (!this.modalDelete.isShown) {
      this.modalDelete.show();
    }
  }

  //Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    if (!this.modalError.isShown) {
      this.modalError.show();
    }
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = {
      name : error.name,
      status : error.status,
      statusText : error.statusText,
      message : error.message
    };

    if (!this.modalException.isShown) {
      this.modalException.show();
    }
  }
}
