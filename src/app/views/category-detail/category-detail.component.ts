import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Language, MessageException, MessageError, Category, CategoryLanguage } from '../../services/models';
import { environment } from '../../../environments/environment';

interface FormData {
  identifier: string;
  title: string[];
}

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.css']
})

export class CategoryDetailComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  formData: FormData;
  currentLanguage: string;
  languages: Array<Language>;
  category: Category;
  @ViewChild('modalDelete') public modalDelete: ModalDirective;
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
  }

  // Page init
  ngOnInit(): void {
    if (this.uuid) {
      this.getCategory();
    }
  }

  // Get category details
  async getCategory() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Category>(this.userdata.mainUrl + this.userdata.mainPort + "/categories/" + this.uuid, {headers} )
    .subscribe(dataCategory=> {
      this.category = dataCategory;

      if (this.category) {
        this.formData.identifier = this.category.identifier;
      
        this.getCategoryLanguages();
      }
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Get category languages
  async getCategoryLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Array<CategoryLanguage>>(this.userdata.mainUrl + this.userdata.mainPort + "/categories/" + this.uuid + "/categories-languages", {headers} )
    .subscribe(dataLangs=> {
      dataLangs.forEach(elementLang => {
        this.formData.title[elementLang.language] = elementLang.category;
      });
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Save category
  async saveCategory() {
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

    //Check if there are no errors
    if (this.errorsDescriptions.length === 0) {
      //Data save
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      let postParams = {
        identifier: this.formData.identifier,
        type: 'structures'
      };

      //Check if update or insert
      if (this.uuid) {
        //Update the category
        this.http.patch(this.userdata.mainUrl + this.userdata.mainPort + "/categories/" + this.uuid,postParams, {headers} )
        .subscribe(async data => {
          await this.saveCategoryLanguages();

          this.router.navigateByUrl('/categories');
        }, error => {
          this.showExceptionMessage(error);
        });
      } else {
        //Insert the category
        this.http.post<Category>(this.userdata.mainUrl + this.userdata.mainPort + "/categories", postParams, {headers} )
        .subscribe(async data => {
          this.uuid = data.idCategory;
          await this.saveCategoryLanguages();

          this.router.navigateByUrl('/categories');
        }, error => {
          this.showExceptionMessage(error);
        });
      }
    } else {
      //Missing data
      this.showErrorMessage(
        this.translate.instant('Missing data'),
        this.translate.instant('The data entered is incorrect or missing.')
      );
    }
  }

  // Save category languages
  async saveCategoryLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    //Update the category languages
    this.languages.forEach(element => {
      let postParams = {
        idCategory: this.uuid,
        alias: this.slugifyPipe.transform(this.formData.identifier),
        language: element.value,
        category: this.formData.title[element.value]
      };

      this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/categories-languages", postParams, {headers} )
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

  // Delete category
  deleteCategory(idCategory) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(this.userdata.mainUrl + this.userdata.mainPort + "/categories/" + idCategory, {headers} )
    .subscribe(data => {
      this.router.navigateByUrl('/categories');
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  //Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

  //Exception message
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

