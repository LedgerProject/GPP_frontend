import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.css']
})

export class CountryDetailComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  formData: any;
  http_response:any;
  current_language:any;
  languages:any;
  
  name_langs: any;
  country: any;

  @ViewChild('modalDelete') public modalDelete: ModalDirective;

  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: any;
  errorsDescriptions: any;

  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: any;
  
  status: { isOpen: boolean } = { isOpen: false };
  disabled: boolean = false;
  isDropup: boolean = true;
  autoClose: boolean = false;

  constructor (
    private router: Router,
    private _Activatedroute:ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService,
    private slugifyPipe: SlugifyPipe
    ) {
    this.formData = { identifier: '', title: [], completed: '' };
    this.http_response = null;
    this.current_language = this.translate.getDefaultLang();
    this.languages = [{ 'name': 'English', 'value': 'en'}, { 'name': 'Français', 'value': 'fr' }];
    
    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.name_langs = [];
    this.country = { identifier: '', completed: '' };

    this.messageError = { title : '', description : '' };
    this.errorsDescriptions = [];

    this.messageException = { name : '', status : '', statusText : '', message : '' };
  }

  ngOnInit(): void {
    if (this.uuid) {
      this.getCountry(this.token);
    } else {
      this.formData.completed = 'no';
    }
  }

  async getCountry(token) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/countries/" + this.uuid, {headers} )
    .subscribe(data_country=> {
      this.country = data_country;

      if (this.country) {
        this.formData.identifier = this.country.identifier;
        if (this.country.completed == true) {
          this.formData.completed = 'yes';
        } else {
          this.formData.completed = 'no';
        }
      }

      //Name (languages)
      this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/countries/" + this.uuid + "/countries-languages", {headers} )
      .subscribe(data_text=> {
        this.name_langs = data_text;
        this.name_langs.forEach(text_element => {
          this.formData.title[text_element.language] = text_element.country;
        });
      }, error => {
        this.showExceptionMessage(error);
      });
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  doSave() {
    this.errorsDescriptions = [];

    //Check if entered the identifier
    if (!this.formData.identifier) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the country identifier'));
    }

    //Check if entered the status
    if (!this.formData.completed) {
      this.errorsDescriptions.push(this.translate.instant('Please, select the status (completed or not completed)'));
    }

    //Check if entered all the languages
    let validate = 1;
    this.languages.forEach(element => {
      if (!this.formData.title[element.value]) {
        validate = 0;
      }
    });

    if (validate === 0) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the country name in each language'));
    }

    if (this.errorsDescriptions.length === 0) {
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

      //Check if update or insert
      if (this.uuid) {
        //Update the country
        this.http.patch(this.userdata.mainUrl + this.userdata.mainPort + "/countries/" + this.uuid, postParams, {headers} )
        .subscribe(data=> {
          this.doSaveLanguages();

          this.router.navigateByUrl('/countries');
        }, error => {
          this.showExceptionMessage(error);
        });
      } else {
        //Insert the country
        this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/countries/", postParams, {headers} )
        .subscribe(data=> {
          this.http_response = data;
          this.uuid = this.http_response.idCountry;
          this.doSaveLanguages();
          
          this.router.navigateByUrl('/countries');
        }, error => {
          this.showExceptionMessage(error);
        });
      }
    } else {
      this.showErrorMessage(
        this.translate.instant('Missing data'),
        this.translate.instant('The data entered is incorrect or missing.')
      );
    }
  }

  doSaveLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    //Update the country languages
    this.languages.forEach(element => {
      let subpostParams = {
        idCountry: this.uuid,
        alias: this.slugifyPipe.transform(this.formData.identifier),
        language: element.value,
        country: this.formData.title[element.value]
      };

      this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/countries-languages", subpostParams, {headers} )
      .subscribe(subdata=> {
      }, error => {
        this.showExceptionMessage(error);
      });
    });
  }

  async doSwitchTextarea(lang) {
    this.current_language = lang;
  }

  doDelete(idCountry) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(this.userdata.mainUrl + this.userdata.mainPort + "/countries/" + idCountry, {headers} )
    .subscribe(data=> {
      this.http_response = data;
      this.router.navigateByUrl('/countries');
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  onHidden(): void {
    //console.log('Dropdown is hidden');
  }
  onShown(): void {
    //console.log('Dropdown is shown');
  }
  isOpenChange(): void {
    //console.log('Dropdown state is changed');
  }

  toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isOpen = !this.status.isOpen;
  }

  change(value: boolean): void {
    this.status.isOpen = value;
  }

  //Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
