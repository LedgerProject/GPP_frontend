import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css']
})
export class CategoryDetailComponent implements OnInit {
  @Input() uuid: string;
  response:any;
  formData: any;
  http_response:any;
  current_language:any;
  languages:any;
  token: any;
  name_langs: any;
  category: any;

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
    private slugifyPipe: SlugifyPipe,
    ) {
    this.formData = { identifier: '', title: [] };
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.current_language = this.translate.getDefaultLang();
    this.languages = [{ 'name': 'English', 'value':'en' },{ 'name': 'Français', 'value': 'fr' }];

    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.name_langs = [];
    this.category = { identifier: '' };

    this.messageError = { title : '', description : '' };
    this.errorsDescriptions = [];

    this.messageException = { name : '', status : '', statusText : '', message : ''};
  }

  ngOnInit(): void {
    if (this.uuid) {
      this.getCategory(this.token);
    }
  }

  async getCategory(token) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/categories/" + this.uuid, {headers} )
    .subscribe(data_category=> {
      this.category = data_category;

      if (this.category) {
        this.formData.identifier = this.category.identifier;
      }

      //Name (languages)
      this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/categories/" + this.uuid + "/categories-languages", {headers} )
      .subscribe(data_text=> {
        this.name_langs = data_text;
        this.name_langs.forEach(text_element => {
          this.formData.title[text_element.language] = text_element.category;
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
      this.errorsDescriptions.push(this.translate.instant('Please, enter the category identifier'));
    }

    //Check if entered all the languages
    let validate = 1;
    this.languages.forEach(element => {
      if (!this.formData.title[element.value]) {
        validate = 0;
      }
    })

    if (validate === 0) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the category name in each language'));
    }

    if (this.errorsDescriptions.length === 0) {
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      let postParams = {
        identifier: this.formData.identifier,
        type: 'structures'
      };

      //Check if update or insert
      if (this.uuid) {
        //Update the category
        this.http.patch(this.userdata.mainUrl + this.userdata.mainPort + "/categories/" + this.uuid,postParams, {headers} )
        .subscribe(data=> {
          this.doSaveLanguages();

          this.router.navigateByUrl('/categories');
        }, error => {
          this.showExceptionMessage(error);
        });
      } else {
        //Insert the category
        this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/categories", postParams, {headers} )
        .subscribe(data=> {
          this.http_response= data;
          this.uuid = this.http_response.idCategory;
          this.doSaveLanguages();

          this.router.navigateByUrl('/categories');
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

    //Update the category languages
    this.languages.forEach(element => {
      let subpostParams = {
        idCategory: this.uuid,
        alias: this.slugifyPipe.transform(this.formData.identifier),
        language: element.value,
        category: this.formData.title[element.value]
      };

      this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/categories-languages", subpostParams, {headers} )
      .subscribe(subdata=> {
      }, error => {
        this.showExceptionMessage(error);
      });
    });
  }

  async doSwitchTextarea(lang) {
    this.current_language = lang;
  }

  doDelete(idCategory) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(this.userdata.mainUrl + this.userdata.mainPort + "/categories/" + idCategory, {headers} )
    .subscribe(data=> {
      this.http_response = data;
      this.router.navigateByUrl('/categories');
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

