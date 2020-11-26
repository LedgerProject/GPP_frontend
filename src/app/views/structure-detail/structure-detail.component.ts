import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-structure-detail',
  templateUrl: './structure-detail.component.html',
  styleUrls: ['./structure-detail.component.css']
})
export class StructureDetailComponent implements OnInit {
  @Input() uuid: string;
  response:any;
  formData: any;
  http_response:any;
  current_language:any;
  languages:any;
  token: any;
  idOrganization: any;
  categories: any;
  icons: any;
  prefixes: any;
  text_langs: any;
  structure_categories: any;
  structure_images:any;
  images:any;

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

  imgsrc: any;
  uploadForm: FormGroup;

  //Google Map
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow
  zoom = 14;
  center: {lat: 0, lng: 0};
  options: google.maps.MapOptions = {
    //mapTypeId: 'hybrid',
    //zoomControl: false,
    //scrollwheel: false,
    //disableDoubleClickZoom: true,
    //maxZoom: 15,
    //minZoom: 8
  }
  markers = [];
  infoContent = '';
  //end

  constructor (
    private router: Router,
    private _Activatedroute:ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService,
    private slugifyPipe: SlugifyPipe,
    public _d: DomSanitizer,
    private formBuilder: FormBuilder
    ) {
    this.formData = { name: '',address:'', city:'',latitude:'',longitude:'', category:[], icon:'', email: '', phone: '', phonePrefix: '', website: '', text: []};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.current_language = this.translate.getDefaultLang();
    this.languages = [{ 'name': 'English', 'value': 'en' }, { 'name':'Français', 'value': 'fr' }];
    this.prefixes = ['+39','+40','+41'];
    this.token = localStorage.getItem('token');
    this.categories = [];
    this.icons = [];
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.text_langs = [];
    this.structure_categories = [];
    this.structure_images = [];
    this.imgsrc= '';
    this.images = [];

    this.messageError = { title : '', description : '' };
    this.errorsDescriptions = [];

    this.messageException = { name : '', status : '', statusText : '', message : '' };
  }

  ngOnInit(): void {
    this.getStructure(this.token);
    this.getImages(this.token);
    if (this.uuid) {
      this.getCategories(this.token);
      this.uploadForm = this.formBuilder.group({
        profile: ['']
      });
    }
  }

  onFileSelect(event) {
    const file = event.srcElement.files[0];
    this.imgsrc = window.URL.createObjectURL(file);
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('profile').setValue(file);
      let element:HTMLElement = document.getElementById('upload-submit') as HTMLElement;
      element.click();
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('file', this.uploadForm.get('profile').value);
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/structures-images/"+this.uuid, formData, {headers})
    .subscribe(res => {
      this.imgsrc = '';
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/structures/"+this.uuid+"/structures-images", {headers} )
      .subscribe(data_image=> {
        this.structure_images = data_image;
        let x = 0;
        this.structure_images.forEach(element => {
          this.structure_images[x].filename = encodeURIComponent(this.structure_images[x].filename);
          x++;
        });

      }, error => {

      });

    },error => {
      let code = error.status;
      if (code == 409) {
        alert( this.translate.instant('Sorry, File already exists') );
        this.imgsrc = '';
      } else if (code == 400) {
        alert( this.translate.instant('Please select an image/jpeg file'));
        this.imgsrc = '';
      }
      console.log(error);
    });
  }

  doMarker(event: google.maps.MouseEvent) {
    this.markers = [];
    this.formData.latitude = event.latLng.lat();
    this.formData.longitude = event.latLng.lng();

    this.markers.push({
      position: {
        lat: this.formData.latitude,
        lng: this.formData.longitude,
      },
    })
  }

  async getCategories(token) {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    // Categories filter
    let filter = ' \
      { \
        "where": { \
          "type": "structures" \
        }, \
        "fields": { \
          "idCategory": true, \
          "identifier": true, \
          "type": false \
        }, \
        "offset": 0, \
        "limit": 100, \
        "skip": 0, \
        "order": ["identifier"] \
      }';

    // Get categories list
    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/categories?filter=" + filter, {headers} )
    .subscribe(data_cat=> {
      this.categories = data_cat;

      // Get categories associated to the structure
      this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/structures/" + this.uuid + '/structures-categories', {headers} )
      .subscribe(structure_data=> {
        let structure_categories:any = [];
        structure_categories = structure_data;

        this.categories.forEach(element => {
          let cat_array = [];
          cat_array['idCategory'] = element.idCategory;
          cat_array['idStructureCategory'] = '';
          cat_array['identifier'] = element.identifier;
          cat_array['value'] = false;
          structure_categories.forEach(subelement => {
            if (subelement.idCategory == element.idCategory) {
              cat_array['value'] = true;
              cat_array['idStructureCategory'] = subelement.idStructureCategory;
            }
          });
          this.structure_categories.push(cat_array);
        });
      }, error => {
        this.showExceptionMessage(error);
      });
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  async getImages(token) {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/structures/" + this.uuid + "/structures-images", {headers} )
    .subscribe(data_image=> {
      this.structure_images = data_image;
      let x = 0;
      
      this.structure_images.forEach(element => {
        this.structure_images[x].filename = encodeURIComponent(this.structure_images[x].filename);
        x++;
      });
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  async getStructure(token) {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    //Icons filter
    let filter = ' \
      { \
        "fields": { \
          "idIcon": true, \
          "name": true, \
          "image": false, \
          "marker": false \
        }, \
        "offset": 0, \
        "limit": 100, \
        "skip": 0 \
        "order": ["name"] \
      }';

    // Get icons list
    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/icons/", {headers} )
    .subscribe(data_icons=> {
      this.icons = data_icons;

      // Get structure data
      this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/structures/" + this.uuid, {headers} )
      .subscribe(data=> {
        this.http_response = data;

        this.formData.name = this.http_response.name;
        this.formData.address = this.http_response.address;
        this.formData.city = this.http_response.city;
        this.formData.email = this.http_response.email;
        this.formData.latitude = this.http_response.latitude;
        this.formData.longitude = this.http_response.longitude;
        this.formData.phone = this.http_response.phoneNumber;
        this.formData.phonePrefix = this.http_response.phoneNumberPrefix;
        this.formData.website = this.http_response.website;
        this.formData.icon = this.http_response.idIcon;

        this.center = {lat: this.formData.latitude , lng: this.formData.longitude };
        this.markers.push({
          position: {
            lat: this.formData.latitude,
            lng: this.formData.longitude,
          },
        })

        //Description (languages)
        this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/structures/" + this.uuid + "/structures-languages", {headers} )
        .subscribe(data_text=> {
          this.text_langs = data_text;
          this.text_langs.forEach(text_element => {
            this.formData.text[text_element.language] = text_element.description;
          });
        }, error => {
          this.showExceptionMessage(error);
        });
      }, error => {
        this.showExceptionMessage(error);
      });
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  async doUpdate() {
    if (!this.formData.name) {
      alert( this.translate.instant('Please, enter the Name') );
    } else if (!this.formData.address) {
      alert( this.translate.instant('Please, enter the Address') );
    } else if (!this.formData.city) {
      alert( this.translate.instant('Please, enter the City') );
    } else if (!this.formData.latitude || !this.formData.longitude) {
      alert( this.translate.instant('Please, set the location on the map') );
    } else if (!this.formData.email) {
      alert( this.translate.instant('Please, enter the Email address') );
    } else if (!this.formData.icon) {
      alert( this.translate.instant('Please, select the Icon') );
    } else {
    let postParams = {
      idStructure: this.uuid,
      idOrganization: this.idOrganization,
      alias: this.slugifyPipe.transform(this.formData.name),
      name: this.formData.name,
      address: this.formData.address,
      city: this.formData.city,
      latitude: this.formData.latitude,
      longitude: this.formData.longitude,
      email: this.formData.email,
      phoneNumberPrefix: this.formData.phonePrefix,
      phoneNumber: this.formData.phone,
      idIcon: this.formData.icon,
      website: this.formData.website,

    };

      let headers = new HttpHeaders()
        .set("Authorization", "Bearer "+this.token)
      ;
      this.http.patch(this.userdata.mainUrl+this.userdata.mainPort+"/structures/"+this.uuid,postParams, {headers} )
      .subscribe(data=> {
        this.http_response = data;

        this.languages.forEach(element => {
          let subpostParams = {
            idStructure: this.uuid,
            language: element.value,
            description: this.formData.text[element.value]
          };
          this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/structures-languages",subpostParams, {headers} )
          .subscribe(subdata=> {
            //this.http_response = data;
            //console.log(subdata);
          }, error => {
            let code = error.status;
            console.log(error);
          });
        });
        alert( this.translate.instant('Save completed') )

      }, error => {
        let code = error.status;
        if (code == 422) {
          alert( this.translate.instant('Organization name is not valid') );
        }
        console.log(error);
      });
    }
  }

  doCheckCategory(idCategory,value,idStructureCategory) {

    let x = 0;
    this.structure_categories.forEach(element => {
      if (element.idCategory == idCategory) {
        if (value == true) {
          this.structure_categories[x].idStructureCategory = '';
          this.structure_categories[x].value = false;
          this.doDeleteCategory(idStructureCategory);
        } else {
          this.structure_categories[x].value = true;
          this.doSaveCategory(idCategory);
        }
      }
      x++;
    });
  }

  doSaveCategory(idCategory) {
    let postParams = {
      idCategory: idCategory,
      idStructure: this.uuid
    };
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/structures-categories",postParams, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        if (this.http_response.idStructureCategory) {
          let x = 0;
          this.structure_categories.forEach(element => {
            if (element.idCategory == this.http_response.idCategory) {
                this.structure_categories[x].idStructureCategory = this.http_response.idStructureCategory;
            }
            x++;
          });
        }
      }, error => {
        console.log(error);
      });
  }

  doDeleteCategory(idStructureCategory) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.delete(this.userdata.mainUrl+this.userdata.mainPort+"/structures-categories/"+idStructureCategory, {headers} )
      .subscribe(data=> {
        this.http_response = data;
      }, error => {
        console.log(error);
      });
  }

  async doSwitchTextarea(lang) {
    this.current_language = lang;
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

  doDeleteImage(idStructureImage) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.delete(this.userdata.mainUrl+this.userdata.mainPort+"/structures-images/"+idStructureImage, {headers} )
      .subscribe(data=> {
        this.http_response = data;

        this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/structures/"+this.uuid+"/structures-images", {headers} )
        .subscribe(data_image=> {
          this.structure_images = data_image;
          let x = 0;
          this.structure_images.forEach(element => {
            this.structure_images[x].filename = encodeURIComponent(this.structure_images[x].filename);
            x++;
          });

        }, error => {

        });

      }, error => {
        console.log(error);
      });
  }

  doDelete(idStructure) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.delete(this.userdata.mainUrl+this.userdata.mainPort+"/structures/"+idStructure, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        this.router.navigateByUrl('/structures');
      }, error => {
        console.log(error);
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
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
