import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../services/slugify.pipe';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Language, MessageException, MessageError, Nationality, NationalityLanguage } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";

interface FormData {
  identifier: string;
  title: string[];
}

@Component({
  selector: 'app-nationality-detail',
  templateUrl: './nationality-detail.component.html',
  styleUrls: ['./nationality-detail.component.css']
})

export class NationalityDetailComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  formData: FormData;
  currentLanguage: string;
  languages: Array<Language>;
  nationality: Nationality;
  messageError: MessageError;
  errorsDescriptions: string[];
  messageException: MessageException;
  name_langs: any;

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
      title: []
    };

    this.name_langs = [];
  }

  // Page init
  ngOnInit(): void {
    if (this.uuid) {
      this.getNationality();
    }
  }

  // Get nationality details
  async getNationality() {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Nationality>(environment.apiUrl + environment.apiPort + "/nationalities/" + this.uuid, {headers} )
    .subscribe(dataNationality => {
      this.SpinnerService.hide();

      this.nationality = dataNationality;

      if (this.nationality) {
        this.formData.identifier = this.nationality.identifier;

        this.getNationalityLanguages();
      }
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });
  }

  // Get nationality languages
  async getNationalityLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Array<NationalityLanguage>>(environment.apiUrl + environment.apiPort + "/nationalities/" + this.uuid + "/nationalities-languages", {headers} )
    .subscribe(dataLangs=> {
      dataLangs.forEach(elementLang => {
        this.formData.title[elementLang.language] = elementLang.nationality;
      });
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Save nationality
  async saveNationality() {
    this.errorsDescriptions = [];

    // Check if entered the identifier
    if (!this.formData.identifier) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the nationality identifier'));
    }

    // Check if entered all the languages
    let validate = 1;
    this.languages.forEach(element => {
      if (!this.formData.title[element.value]) {
        validate = 0;
      }
    });

    if (validate === 0) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the nationality name in each language'));
    }

    // Check if there are no errors
    if (this.errorsDescriptions.length === 0) {
      this.SpinnerService.show();

      // Data save
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      let postParams = {
        identifier: this.formData.identifier
      };

      //Check if update or insert
      if (this.uuid) {
        //Update the nationality
        this.http.patch(environment.apiUrl + environment.apiPort + "/nationalities/" + this.uuid, postParams, {headers} )
        .subscribe(async data => {
          this.SpinnerService.hide();

          await this.saveNationalityLanguages();

          this.router.navigateByUrl('/nationalities');
        }, error => {
          this.SpinnerService.hide();

          this.showExceptionMessage(error);
        });
      } else {
        //Insert the nationality
        this.http.post<Nationality>(environment.apiUrl + environment.apiPort + "/nationalities/",postParams, {headers} )
        .subscribe(async data => {
          this.SpinnerService.hide();
          this.uuid = data.idNationality;

          await this.saveNationalityLanguages();

          this.router.navigateByUrl('/nationalities');
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

  // Save nationality languages
  async saveNationalityLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Update the nationality languages
    this.languages.forEach(element => {
      let subpostParams = {
        idNationality: this.uuid,
        alias: this.slugifyPipe.transform(this.formData.identifier),
        language: element.value,
        nationality: this.formData.title[element.value]
      };

      this.http.post(environment.apiUrl + environment.apiPort + "/nationalities-languages", subpostParams, {headers} )
      .subscribe(dataLang=> {
      }, error => {
        this.showExceptionMessage(error);
      });
    });
  }

  // Switch language
  async switchTextarea(lang) {
    this.currentLanguage = lang;
  }

  // Delete nationality
  deleteNationality(idNationality) {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(environment.apiUrl + environment.apiPort + "/nationalities/" + idNationality, {headers} )
    .subscribe(data=> {
      this.SpinnerService.hide();

      this.router.navigateByUrl('/nationalities');
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
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
