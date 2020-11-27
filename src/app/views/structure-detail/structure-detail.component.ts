import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GeocodeService } from '../../services/geocode.service';
import { Location } from '../../services/location-model';

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
  address = 'Napoli';
  location: Location;
  loading: boolean;
  idStructureImageDelete: any;

  @ViewChild('modalInfo') public modalInfo: ModalDirective;

  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  @ViewChild('modalDeleteImage') public modalDeleteImage: ModalDirective;

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

  constructor (
    private router: Router,
    private _Activatedroute:ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService,
    private slugifyPipe: SlugifyPipe,
    public _d: DomSanitizer,
    private formBuilder: FormBuilder,
    private geocodeService: GeocodeService,
    private ref: ChangeDetectorRef
    ) {
    this.formData = { name: '',address:'', city:'',latitude:'',longitude:'', category:[], icon:'', email: '', phone: '', phonePrefix: '', website: '', text: []};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.current_language = this.translate.getDefaultLang();
    this.languages = [{ 'name': 'English', 'value': 'en' }, { 'name': 'Français', 'value': 'fr' }];
    this.prefixes = ['+1', '+1 242', '+1 246', '+1 264', '+1 268', '+1 284', '+1 345', '+1 441', '+1 473', '+1 649', '+1 664', '+1 721', '+1 758', '+1 767', '+1 784', '+1 787', '+1 809', '+1 829', '+1 849', '+1 868', '+1 869', '+1 876', '+20', '+210', '+211', '+212', '+213', '+214', '+215', '+216', '+217', '+218', '+219', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+259', '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269', '+27', '+290', '+291', '+297', '+298', '+299', '+30', '+31', '+32', '+33', '+34', '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', '+36', '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+379', '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+388', '+389', '+39', '+40', '+41', '+420', '+421', '+423', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', '+509', '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', '+599 3', '+599 4', '+599 7', '+599 9', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', '+680', '+681', '+682', '+683', '+685', '+686', '+687', '+688', '+689', '+690', '+691', '+692', '+7', '+800', '+808', '+81', '+82', '+84', '+850', '+852', '+853', '+855', '+856', '+86', '+880', '+886', '+90', '+91', '+92', '+93', '+94', '+95', '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', '+972', '+973', '+974', '+975', '+976', '+977', '+98', '+992', '+993', '+994', '+995', '+996', '+998'];
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

    this.idStructureImageDelete = '';

    this.messageError = { title : '', description : '' };
    this.errorsDescriptions = [];

    this.messageException = { name : '', status : '', statusText : '', message : '' };
  }

  ngOnInit(): void {
    this.getIconsList(this.token);
    if (this.uuid) {
      this.getCategories(this.token);
      this.getImages(this.token);
      this.uploadForm = this.formBuilder.group({
        profile: ['']
      });
    }
  }

  async getIconsList(token) {
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
        "skip": 0, \
        "order": ["name"] \
      }';

    // Get icons list
    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/icons?filter=" + filter, {headers} )
    .subscribe(data_icons=> {
      this.icons = data_icons;

      if (this.uuid) {
        this.getStructure(token);
      }
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  async getStructure(token) {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    // Get structure data
    if (this.uuid) {
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

        this.location = { lat: this.http_response.latitude, lng: this.http_response.longitude };

        //Description (languages)
        this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/structures/" + this.uuid + "/structures-languages", {headers} )
        .subscribe(data_text=> {
          this.text_langs = data_text;
          this.text_langs.forEach(text_element => {
            let desc = "";
            if (text_element.description) {
              desc = text_element.description;
            }
            this.formData.text[text_element.language] = desc;
          });
        }, error => {
          this.showExceptionMessage(error);
        });
      }, error => {
        this.showExceptionMessage(error);
      });
    }
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

  async doSave() {
    this.errorsDescriptions = [];
  
    //Check if entered the name
    if (!this.formData.name) {
      this.errorsDescriptions.push(this.translate.instant('Please enter the structure name'));
    }
  
    //Check if entered the address
    if (!this.formData.address) {
      this.errorsDescriptions.push(this.translate.instant('Please enter the structure address'));
    }
  
    //Check if entered the city
    if (!this.formData.address) {
      this.errorsDescriptions.push(this.translate.instant('Please enter the structure city'));
    }
  
    //Check if selected the map position
    if (!this.formData.latitude || !this.formData.longitude) {
      this.errorsDescriptions.push(this.translate.instant('Please set the structure location on the map'));
    }
  
    //Check if entered the icon
    if (!this.formData.icon) {
      this.errorsDescriptions.push(this.translate.instant('Please select the structure icon'));
    }
  
    if (this.errorsDescriptions.length === 0) {
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
  
      // If authenticated as gppOperator (that have no organizations)
      if (!this.idOrganization) {
        delete postParams.idOrganization;
      }
  
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
  
      //Check if update or insert
      if (this.uuid) {
        //Update the structure
        this.http.patch(this.userdata.mainUrl+this.userdata.mainPort+"/structures/"+this.uuid,postParams, {headers} )
        .subscribe(data=> {
          this.doSaveLanguages();

          this.modalInfo.show();
        }, error => {
          this.showExceptionMessage(error);
        });
      } else {
        //Insert the structure
        this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/structures", postParams, {headers} )
        .subscribe(data=> {
          this.http_response = data;
          this.uuid = this.http_response.idStructure;
  
          this.doSaveLanguages();
  
          this.router.navigateByUrl('structure-details/' + this.uuid);
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
  
    //Update the structure languages
    this.languages.forEach(element => {
      let subpostParams = {
        idStructure: this.uuid,
        language: element.value,
        description: this.formData.text[element.value]
      };
  
      this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/structures-languages", subpostParams, {headers} )
      .subscribe(subdata=> {
      }, error => {
        this.showExceptionMessage(error);
      });
    });
  }

  async doSwitchTextarea(lang) {
    this.current_language = lang;
  }

  doDelete(idStructure) {
    let headers = new HttpHeaders().set("Authorization", "Bearer "+this.token);

    this.http.delete(this.userdata.mainUrl + this.userdata.mainPort + "/structures/" + idStructure, {headers} )
    .subscribe(data=> {
      this.router.navigateByUrl('/structures');
    }, error => {
      this.showExceptionMessage(error);
    });
  }
  
  doCheckCategory(idCategory, value, idStructureCategory) {
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
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
  
    let postParams = {
      idCategory: idCategory,
      idStructure: this.uuid
    };
    
    this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/structures-categories", postParams, {headers} )
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
      this.showExceptionMessage(error);
    });
  }
  
  doDeleteCategory(idStructureCategory) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
  
    this.http.delete(this.userdata.mainUrl + this.userdata.mainPort + "/structures-categories/" + idStructureCategory, {headers} )
    .subscribe(data=> {
    }, error => {
      this.showExceptionMessage(error);
    });
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
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    const formData = new FormData();
    formData.append('file', this.uploadForm.get('profile').value);
    
    this.http.post(this.userdata.mainUrl + this.userdata.mainPort + "/structures-images/" + this.uuid, formData, {headers})
    .subscribe(res => {
      this.imgsrc = '';
      this.getImages(this.token);
    }, error => {
      let code = error.status;

      switch (code) {
        case 400:
          this.showErrorMessage(this.translate.instant('Error uploading image'), this.translate.instant('Please select a JPEG file.'));
        break;

        case 409:
          this.showErrorMessage(this.translate.instant('Error uploading image'), this.translate.instant('Un immagine con questo nome già esiste. Verifica che tu non l\'abbia già memorizzata, altrimenti rinomina il file.'));
        break;

        default:
          this.showExceptionMessage(error);
        break;
      }
      
    });
  }

  askDelete(idStructureImage) {
    this.idStructureImageDelete = idStructureImage;
    this.modalDeleteImage.show();
  }

  doDeleteImage(idStructureImage) {
    this.modalDeleteImage.hide();
    this.idStructureImageDelete = '';
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(this.userdata.mainUrl + this.userdata.mainPort + "/structures-images/" + idStructureImage, {headers} )
    .subscribe(data=> {
      this.getImages(this.token);
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  doMarker(event) {
    this.formData.latitude = event.coords.lat;
    this.formData.longitude = event.coords.lng;

    this.location = { lat: event.coords.lat, lng: event.coords.lng };
  }

  findAddress() {
    if (this.formData.address && this.formData.city) {
      this.address = this.formData.address + ', ' + this.formData.city;
      this.addressToCoordinates();
    } else {
      this.showErrorMessage(
        this.translate.instant('Unable geocoding'),
        this.translate.instant('Specifica l\'indirizzo ed il comune per effettuare la ricerca.')
      );
    }
  }

  addressToCoordinates() {
    this.loading = true;
    this.geocodeService.geocodeAddress(this.address)
    .subscribe((location: Location) => {
        this.location = location;
        this.formData.latitude = location.lat;
        this.formData.longitude = location.lng;
        this.loading = false;
        this.ref.detectChanges();  
      }      
    );     
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
