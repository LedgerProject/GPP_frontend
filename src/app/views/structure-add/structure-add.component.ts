import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'

@Component({
  selector: 'app-structure-add',
  templateUrl: './structure-add.component.html',
  styleUrls: ['./structure-add.component.css']
})
export class StructureAddComponent implements OnInit {

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

  status: { isOpen: boolean } = { isOpen: false };
  disabled: boolean = false;
  isDropup: boolean = true;
  autoClose: boolean = false;

  //Google Map
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow
  zoom = 2;
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

  constructor (private router: Router,private http:HttpClient,public translate: TranslateService,public userdata: UserdataService, private slugifyPipe: SlugifyPipe) {
    this.formData = { name: '',address:'', city:'',latitude:'',longitude:'',icon:'', email: '', phone: '', phonePrefix: '', website: '', text: []};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.current_language = this.translate.getDefaultLang();
    this.languages = [{ 'name': 'English', 'value':'en'},{ 'name':'Francais','value':'fr' }];
    this.prefixes = ['+39','+40','+41'];
    this.token = localStorage.getItem('token');
    this.categories = [];
    this.icons = [];
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
  }

  ngOnInit(): void {
    //console.log(this.translate.currentLang);
    //this.getCategories(this.token);
    this.getIcons(this.token);
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

/*  async getCategories(token) {
    console.log(token);
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;
    let filter = '{"where":{"type":"structures"},"fields":{"idCategory":true,"identifier":true,"type":true},"offset":0,"limit":100,"skip":0,"order":["identifier"]}';
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/categories?filter="+filter, {headers} )
    .subscribe(data=> {
      this.categories = data;
      console.log(data);
    }, error => {
      let code = error.status;
      console.log(error);
    });
  }*/

  async getIcons(token) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;
    let filter = '{"fields":{"idIcon":true,"name":true,"image":false,"marker":false},"offset":0,"limit":100,"skip":0}';
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/icons/", {headers} )
    .subscribe(data=> {
      this.icons = data;
      //console.log(data);
    }, error => {
      let code = error.status;
      /*if (code == 422) {
        alert( this.translate.instant('Organization name is not valid') );
      }*/
      console.log(error);
    });
  }



  async doAdd() {
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

    if (!this.formData.latitude) {
      this.formData.latitude = 0;
    }
    if (!this.formData.longitude) {
      this.formData.longitude = 0;
    }

    let postParams:any = {

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

    if (!this.idOrganization) {
      delete postParams.idOrganization;
    }

      let headers = new HttpHeaders()
        .set("Authorization", "Bearer "+this.token)
      ;
      this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/structures",postParams, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        //console.log(data);
        let idStructure = this.http_response.idStructure;
        if (idStructure) {
        this.languages.forEach(element => {
          let subpostParams = {
            idStructure: idStructure,
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
        this.router.navigateByUrl('structure-details/'+idStructure);
        } else {
          alert( this.translate.instant('There was a problem, please try again in a few seconds') );
        }
      }, error => {
        let code = error.status;
        if (code == 422) {
          alert( this.translate.instant('Organization name is not valid') );
        }
        console.log(error);
      });
    }
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

}
