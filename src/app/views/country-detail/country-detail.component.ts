import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.css']
})
export class CountryDetailComponent implements OnInit {
  @Input() uuid: string;
  response:any;
  formData: any;
  http_response:any;
  current_language:any;
  languages:any;
  token: any;
  name_langs: any;
  country: any;

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
    this.formData = { identifier: '', title: [], completed: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.current_language = this.translate.getDefaultLang();
    this.languages = [{ 'name': 'English', 'value':'en'},{ 'name':'Francais','value':'fr' }];

    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.name_langs = [];
    this.country = { identifier: '', completed: ''};
  }

  ngOnInit(): void {
    if (this.uuid) {
      this.getCountry(this.token);
    }
  }



  async getCountry(token) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/countries/"+this.uuid, {headers} )
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

          //text descriptions
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/countries/"+this.uuid+"/countries-languages", {headers} )
          .subscribe(data_text=> {
            //console.log(data_text);
            this.name_langs = data_text;
            this.name_langs.forEach(text_element => {
                  this.formData.title[text_element.language] = text_element.country;
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
    } else if (!this.formData.completed) {
      alert( this.translate.instant('Please, select Completed status') );
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
      let completed: Boolean;
      if (this.formData.completed == 'yes') {
        completed = true;
      } else {
        completed = false;
      }
     if (this.uuid) {

      let postParams = {
        idCountry: this.uuid,
        identifier: this.formData.identifier,
        completed: completed
      };
      //console.log(postParams);
      this.http.patch(this.userdata.mainUrl+this.userdata.mainPort+"/countries/"+this.uuid,postParams, {headers} )
      .subscribe(data=> {
        //console.log(data);
        this.http_response = data;
        this.languages.forEach(element => {
          let subpostParams = {
            idCountry: this.uuid,
            alias: this.slugifyPipe.transform(this.formData.identifier),
            language: element.value,
            country: this.formData.title[element.value]
          };
          this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/countries-languages",subpostParams, {headers} )
          .subscribe(subdata=> {
            //this.http_response = data;
            //console.log(subdata);
          }, error => {
            let code = error.status;
            console.log(error);
          });
        });
        this.router.navigateByUrl('/countries');
      }, error => {
        let code = error.message;
        alert(code);
      });

     } else {

      let postParams = {
        identifier: this.formData.identifier,
        completed: completed
      };
      this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/countries/",postParams, {headers} )
      .subscribe(data=> {
        //console.log(data);
        this.http_response= data;
        let idCountry = this.http_response.idCountry;
        if (idCountry) {
        this.languages.forEach(element => {
          let subpostParams = {
            idCountry: idCountry,
            alias: this.slugifyPipe.transform(this.formData.identifier),
            language: element.value,
            country: this.formData.title[element.value]
          };
          this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/countries-languages",subpostParams, {headers} )
          .subscribe(subdata=> {
            //this.http_response = data;
            //console.log(subdata);
          }, error => {
            let code = error.status;
            console.log(error);
          });
        });
        }

        this.router.navigateByUrl('/countries');
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

  doDelete(idCountry) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.delete(this.userdata.mainUrl+this.userdata.mainPort+"/countries/"+idCountry, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        this.router.navigateByUrl('/countries');
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
