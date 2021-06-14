import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../services/slugify.pipe';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Language, MessageException, MessageError, Country, CountryLanguage } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";

interface FormData {
  identifier: string;
  title: string[];
  completed: string;
}

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.css']
})

export class CountryDetailComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  formData: FormData;
  currentLanguage: string;
  languages: Array<Language>;
  country: Country;
  messageError: MessageError;
  errorsDescriptions: string[];
  messageException: MessageException;

  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;

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
    this.formData = {
      identifier: '',
      title: [],
      completed: 'no'
    };
  }

  // Page init
  ngOnInit(): void {
    if (this.uuid) {
      this.getCountry();
    }
  }

  // Get country details
  async getCountry() {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Country>(environment.apiUrl + environment.apiPort + "/countries/" + this.uuid, {headers} )
    .subscribe(dataCountry=> {
      this.country = dataCountry;

      if (this.country) {
        this.formData.identifier = this.country.identifier;

        if (this.country.completed == true) {
          this.formData.completed = 'yes';
        } else {
          this.formData.completed = 'no';
        }
      }

      this.getCountryLanguages();

      this.SpinnerService.hide();
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });
  }

  // Get country languages
  async getCountryLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Array<CountryLanguage>>(environment.apiUrl + environment.apiPort + "/countries/" + this.uuid + "/countries-languages", {headers} )
    .subscribe(dataLangs=> {
      dataLangs.forEach(elementLang => {
        this.formData.title[elementLang.language] = elementLang.country;
      });
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Save country
  async saveCountry() {
    this.errorsDescriptions = [];

    // Check if entered the identifier
    if (!this.formData.identifier) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the country identifier'));
    }

    // Check if entered the status
    if (!this.formData.completed) {
      this.errorsDescriptions.push(this.translate.instant('Please, select the status (completed or not completed)'));
    }

    // Check if entered all the languages
    let validate = 1;
    this.languages.forEach(element => {
      if (!this.formData.title[element.value]) {
        validate = 0;
      }
    });

    if (validate === 0) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the country name in each language'));
    }

    // Check if there are no errors
    if (this.errorsDescriptions.length === 0) {
      this.SpinnerService.show();

      // Data save
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
      let completed: Boolean;

      if (this.formData.completed == 'yes') {
        completed = true;
      } else {
        completed = false;
      }

      let postParams = {
        identifier: this.formData.identifier,
        completed: completed
      };

      // Check if update or insert
      if (this.uuid) {
        // Update the country
        this.http.patch(environment.apiUrl + environment.apiPort + "/countries/" + this.uuid, postParams, {headers} )
        .subscribe(async data => {
          await this.saveCountryLanguages();

          this.SpinnerService.hide();

          this.router.navigateByUrl('/countries');
        }, error => {
          this.SpinnerService.hide();

          this.showExceptionMessage(error);
        });
      } else {
        // Insert the country
        this.http.post<Country>(environment.apiUrl + environment.apiPort + "/countries/", postParams, {headers} )
        .subscribe(async data => {
          this.uuid = data.idCountry;

          await this.saveCountryLanguages();

          this.SpinnerService.hide();

          this.router.navigateByUrl('/countries');
        }, error => {
          this.SpinnerService.hide();

          this.showExceptionMessage(error);
        });
      }
    } else {
      // Missing data
      this.showErrorMessage(
        this.translate.instant('Missing data'),
        this.translate.instant('The data entered is incorrect or missing.')
      );
    }
  }

  // Save country languages
  async saveCountryLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Update the country languages
    this.languages.forEach(element => {
      let postParams = {
        idCountry: this.uuid,
        alias: this.slugifyPipe.transform(this.formData.identifier),
        language: element.value,
        country: this.formData.title[element.value]
      };

      this.http.post(environment.apiUrl + environment.apiPort + "/countries-languages", postParams, {headers} )
      .subscribe(dataLang => {
      }, error => {
        this.showExceptionMessage(error);
      });
    });
  }

  // Switch language
  async switchTextarea(lang) {
    this.currentLanguage = lang;
  }

  // Delete country
  deleteCountry(idCountry) {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(environment.apiUrl + environment.apiPort + "/countries/" + idCountry, {headers} )
    .subscribe(data => {
      this.SpinnerService.hide();

      this.router.navigateByUrl('/countries');
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });
  }

  // Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

  // Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = {
      name : error.name,
      status : error.status,
      statusText : error.statusText,
      message : error.message
    };

    this.modalException.show();
  }
}
