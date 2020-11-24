import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, NavigationEnd,ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';

@Component({
  selector: 'app-country-topics',
  templateUrl: './country-topics.component.html',
  styleUrls: ['./country-topics.component.css']
})
export class CountryTopicsComponent implements OnInit {
  @Input() uuid: string;
  response:any;
  formData: any;
  http_response:any;
  current_language:any;
  languages:any;
  token: any;
  text_langs: any;
  name_langs: any;
  topics: any;
  topics_array: any;
  topics_langs: any;

  status: { isOpen: boolean } = { isOpen: false };
  disabled: boolean = false;
  isDropup: boolean = true;
  autoClose: boolean = false;

  country:any;

  mySubscription;

  constructor (
    private router: Router,
    private _Activatedroute:ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService,
    private slugifyPipe: SlugifyPipe,
    ) {
    this.formData = { id: [], title: [], text: []};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.current_language = this.translate.getDefaultLang();
    this.languages = [{ 'name': 'English', 'value':'en'},{ 'name':'Francais','value':'fr' }];

    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.name_langs = [];
    this.text_langs = [];
    this.topics = [];
    this.topics_array = [];
    this.topics_langs = [];
    this.country = { identifier: '', completed: ''};

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
         // Trick the Router into believing it's last link wasn't previously loaded
         this.router.navigated = false;
      }
    });
  }

  ngOnInit(): void {
    this.getCountry(this.token);
  }

  currentRouter = this.router.url;

  async getCountry(token) {

      let headers = new HttpHeaders()
        .set("Authorization", "Bearer "+token)
      ;
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/countries/"+this.uuid, {headers} )
      .subscribe(data_country=> {
        this.country = data_country;
        //console.log(this.country);
        this.country.idCountry;

            //text descriptions
            let filter = '{"where":{"idCountry":"'+this.country.idCountry+'"},"fields":{"idCountry":true,"identifier":true,"idCountryTopic":true},"offset":0,"limit":100,"skip":0,"order":["identifier"]}';
            this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/countries-topics?filter="+filter, {headers} )
                .subscribe(data_topics=> {
                  //console.log(data_topics);
                  this.topics_array = data_topics;
                  this.topics_array.forEach(current_topics => {

                      let topic:any = {
                        'lang': this.current_language,
                        'id':current_topics.idCountryTopic,
                        'title':[],'text':[]
                      };
                        this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/countries-topics/"+current_topics.idCountryTopic+'/countries-topics-languages', {headers} )
                        .subscribe(data_topic=> {

                            this.topics_langs =  data_topic;
                            this.topics_langs.forEach(data_lang => {
                              topic.title[data_lang.language] = data_lang.topic;
                              topic.text[data_lang.language] = data_lang.description;
                            });
                      });
                      //console.log(topic);
                      this.topics.push(topic);

                  });

                  if (this.topics_array.length == 0) {
                    let empty:any = {'id':'','lang': this.current_language,'title':[],'text':[]};
                    this.languages.forEach(element_lang => {
                      empty.id = '';
                      empty.title[element_lang] = '';
                      empty.text[element_lang] = '';
                    });
                    this.topics.push(empty);
                  }

                }, error => {
                  console.log(error);
                });

      }, error => {
        let code = error.status;
        console.log(error);
      });
  }

  doDelete(counter,id) {
    if (!id) {
      this.topics.splice(counter,1);
    } else {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.delete(this.userdata.mainUrl+this.userdata.mainPort+"/countries-topics/"+id, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        this.topics.splice(counter,1);
      }, error => {
        console.log(error);
      });
    }
  }

  doAdd() {
    let empty:any = {'id':'','lang': this.current_language,'title':[],'text':[]};
    this.languages.forEach(element_lang => {
      empty.id = '';
      empty.title[element_lang] = '';
      empty.text[element_lang] = '';
    });
    this.topics.push(empty);
  }
  async doSwitchTextarea(lang,counter) {
    this.topics[counter].lang = lang;
  }

async doSave() {
    if (this.topics) {
      let validate = 1;
      this.topics.forEach(topic => {
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
        alert( this.translate.instant('Please, enter title and description in each language') );
      } else {
        let headers = new HttpHeaders()
        .set("Authorization", "Bearer "+this.token)
      ;

      let x = 0;
      this.topics.forEach(element => {

        if (element.id) {
          //update
          let postParams = {
            idCountry: this.uuid,
            identifier: this.slugifyPipe.transform(element.title['en']),
          };
          //console.log(postParams);
          this.http.patch(this.userdata.mainUrl+this.userdata.mainPort+"/countries-topics/"+element.id,postParams, {headers} )
          .subscribe(data=> {
            //console.log(data);
            this.http_response = data;
            this.languages.forEach(element_lang => {
              let subpostParams = {
                idCountryTopic: element.id,
                topic: element.title[element_lang.value],
                description: element.text[element_lang.value],
                language: element_lang.value,
              };
              this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/countries-topics-languages",subpostParams, {headers} )
              .subscribe(subdata=> {
                //this.http_response = data;
                //console.log(subdata);
              }, error => {
                let code = error.status;
                console.log(error);
              });
            });

          }, error => {
            let code = error.message;
            alert(code);
          });

        } else {
          //save
          let postParams = {
            idCountry: this.uuid,
            identifier: this.slugifyPipe.transform(element.title['en']),
          };
          //console.log(postParams);
          this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/countries-topics",postParams, {headers} )
          .subscribe(data=> {
            //console.log(data);
            this.http_response = data;
            let element_id = this.http_response.idCountryTopic;
            //this.topics[x] // = this.http_response.idCountryTopic;
            this.languages.forEach(element_lang => {
              let subpostParams = {
                idCountryTopic: element_id,
                topic: element.title[element_lang.value],
                description: element.text[element_lang.value],
                language: element_lang.value,
              };
              this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/countries-topics-languages",subpostParams, {headers} )
              .subscribe(subdata=> {
                //this.http_response = data;
                //console.log(subdata);
              }, error => {
                let code = error.status;
                console.log(error);
              });
            });
            //alert( this.translate.instant('Save completed') );
          }, error => {
            let code = error.message;
            alert(code);
          });

        }
        x++;
      });
      await alert( this.translate.instant('Save completed') );
      this.router.navigate([this.currentRouter]);
      }
    }
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
