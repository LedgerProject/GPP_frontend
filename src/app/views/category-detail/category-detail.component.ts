import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';

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
    this.formData = { identifier: '', title: []};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.current_language = this.translate.getDefaultLang();
    this.languages = [{ 'name': 'English', 'value':'en'},{ 'name':'Francais','value':'fr' }];

    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.name_langs = [];
    this.category = { identifier: ''};
  }

  ngOnInit(): void {
    if (this.uuid) {
      this.getCategory(this.token);
    }
  }



  async getCategory(token) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/categories/"+this.uuid, {headers} )
    .subscribe(data_category=> {
      this.category = data_category;

      if (this.category) {
        this.formData.identifier = this.category.identifier;
      }

          //text descriptions
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/categories/"+this.uuid+"/categories-languages", {headers} )
          .subscribe(data_text=> {
            //console.log(data_text);
            this.name_langs = data_text;
            this.name_langs.forEach(text_element => {
                  this.formData.title[text_element.language] = text_element.category;
                  //console.log(text_element);
            });
          }, error => {
            console.log(error);
          });

    }, error => {
      let code = error.status;
      console.log(error);
    });
  }

  doSave() {
    if (!this.formData.identifier) {
      alert( this.translate.instant('Please, enter the Identifier') );
    } else {
      let validate = 1;
      this.languages.forEach(element => {
        if (!this.formData.title[element.value]) {
          validate = 0;
        }
      })

      if (validate == 0) {
        alert( this.translate.instant('Please, enter the name in each language') );
      } else if (validate == 1) {
      let headers = new HttpHeaders()
        .set("Authorization", "Bearer "+this.token)
      ;
     if (this.uuid) {

      let postParams = {
        idCategory: this.uuid,
        identifier: this.formData.identifier,
        type: 'structures'
      };
      //console.log(postParams);
      this.http.patch(this.userdata.mainUrl+this.userdata.mainPort+"/categories/"+this.uuid,postParams, {headers} )
      .subscribe(data=> {
        //console.log(data);
        this.http_response = data;
        this.languages.forEach(element => {
          let subpostParams = {
            idCategory: this.uuid,
            alias: this.slugifyPipe.transform(this.formData.identifier),
            language: element.value,
            category: this.formData.title[element.value]
          };
          this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/categories-languages",subpostParams, {headers} )
          .subscribe(subdata=> {
            //this.http_response = data;
            //console.log(subdata);
          }, error => {
            let code = error.status;
            console.log(error);
          });
        });
        this.router.navigateByUrl('/categories');
      }, error => {
        let code = error.message;
        alert(code);
      });

     } else {

      let postParams = {
        identifier: this.formData.identifier,
        type: 'structures'
      };
      this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/categories/",postParams, {headers} )
      .subscribe(data=> {
        //console.log(data);
        this.http_response= data;
        let idCategory = this.http_response.idCategory;
        if (idCategory) {
        this.languages.forEach(element => {
          let subpostParams = {
            idCategory: idCategory,
            alias: this.slugifyPipe.transform(this.formData.identifier),
            language: element.value,
            category: this.formData.title[element.value]
          };
          this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/categories-languages",subpostParams, {headers} )
          .subscribe(subdata=> {
            //this.http_response = data;
            //console.log(subdata);
          }, error => {
            let code = error.status;
            console.log(error);
          });
        });
        }

        this.router.navigateByUrl('/categories');
      }, error => {
        let code = error.status;
        console.log(error);
      });

     }
    }
    }
  }

  async doSwitchTextarea(lang) {
    this.current_language = lang;
  }

  doDelete(idCategory) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.delete(this.userdata.mainUrl+this.userdata.mainPort+"/categories/"+idCategory, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        this.router.navigateByUrl('/categories');
      }, error => {
        console.log(error);
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

}

