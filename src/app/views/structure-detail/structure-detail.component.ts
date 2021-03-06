import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../services/slugify.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GeocodeService } from '../../services/geocode.service';
import { Location } from '../../services/location-model';
import { Language, MessageException, MessageError, MessageInfo, Structure, StructureLanguage, StructureCategory, StructureImage, Icon, Category } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";

interface FormData {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: string[];
  icon: string;
  email: string;
  phone: string;
  phonePrefix: string;
  website: string;
  text: string[];
}

interface FormDataStructureCategories {
  idStructureCategory: string;
  idCategory: string;
  identifier: string;
  value: boolean;
}

interface FormReject {
  description: string
}

@Component({
  selector: 'app-structure-detail',
  templateUrl: './structure-detail.component.html',
  styleUrls: ['./structure-detail.component.css']
})

export class StructureDetailComponent implements OnInit, AfterViewInit {
  token: string;
  idOrganization: string;
  @Input() uuid: string;
  formData: FormData;
  formReject: FormReject;
  structureCategories: Array<FormDataStructureCategories>;
  structureImages: Array<StructureImage>
  uploadForm: FormGroup;
  currentLanguage: string;
  languages: Array<Language>;
  prefixes: string[];
  structure: Structure;
  icons: Array<Icon>;
  messageException: MessageException;
  messageInfo: MessageInfo;
  messageError: MessageError;
  errorsDescriptions: string[];
  idStructureImageDelete: string;
  loadingCoordinates: boolean;
  structureImageSrc: string;
  imagesPath: string;
  action: string;
  getAction: string;
  publicationStatus: string;
  rejectionMessage: string;
  userType: string;
  publicationStatusClass: string;

  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  @ViewChild('modalDeleteImage') public modalDeleteImage: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalReject') public modalReject: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;

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
    private ref: ChangeDetectorRef,
    private SpinnerService: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.currentLanguage = this.translate.getDefaultLang();
    this.languages = environment.languages;
    this.prefixes = ['+1', '+1 242', '+1 246', '+1 264', '+1 268', '+1 284', '+1 345', '+1 441', '+1 473', '+1 649', '+1 664', '+1 721', '+1 758', '+1 767', '+1 784', '+1 787', '+1 809', '+1 829', '+1 849', '+1 868', '+1 869', '+1 876', '+20', '+210', '+211', '+212', '+213', '+214', '+215', '+216', '+217', '+218', '+219', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+259', '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269', '+27', '+290', '+291', '+297', '+298', '+299', '+30', '+31', '+32', '+33', '+34', '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', '+36', '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+379', '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+388', '+389', '+39', '+40', '+41', '+420', '+421', '+423', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', '+509', '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', '+599 3', '+599 4', '+599 7', '+599 9', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', '+680', '+681', '+682', '+683', '+685', '+686', '+687', '+688', '+689', '+690', '+691', '+692', '+7', '+800', '+808', '+81', '+82', '+84', '+850', '+852', '+853', '+855', '+856', '+86', '+880', '+886', '+90', '+91', '+92', '+93', '+94', '+95', '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', '+972', '+973', '+974', '+975', '+976', '+977', '+98', '+992', '+993', '+994', '+995', '+996', '+998'];
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
    this.messageInfo = environment.messageErrorInit;
    this.errorsDescriptions = [];
    this.formData = {
      name: '',
      address: '',
      city: '',
      latitude: 0,
      longitude: 0,
      categories: [],
      icon: '',
      email: '',
      phone: '',
      phonePrefix: '',
      website: '',
      text: [],
    };
    this.structureCategories = [];
    this.structureImages = [];
    this.idStructureImageDelete = '';
    this.imagesPath = environment.imagesUrl;
    this.getAction = this._Activatedroute.snapshot.queryParamMap.get("action");
    this._Activatedroute.queryParamMap.subscribe(queryParams => {
      this.getAction = queryParams.get("action")
    })
    if (this.getAction) {
      this.action = this.getAction;
    }
    this.publicationStatus = '';
    this.rejectionMessage = '';
    this.publicationStatusClass = '';
    this.userType = localStorage.getItem('userType');
    this.formReject = {
      description: ''
    }
  }

  ngAfterViewInit(): void {
    if (this.action == 'success') {
      this.showInfoMessage(this.translate.instant('Structure saved'),this.translate.instant('The information has been saved.'));
    }
  }

  // Page init
  ngOnInit(): void {
    this.getIconsList();
    if (this.uuid) {
      this.getStructureCategories();
      this.getStructureImages();
      this.uploadForm = this.formBuilder.group({
        profile: ['']
      });
    }
  }

  // Get icons list
  async getIconsList() {
    this.SpinnerService.show();
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Icons filter
    let filter = ' \
      { \
        "fields": { \
          "idIcon": true, \
          "name": true, \
          "image": false, \
          "marker": false \
        }, \
        "offset": 0, \
        "skip": 0, \
        "order": ["name"] \
      }';

    this.http.get<Array<Icon>>(environment.apiUrl + environment.apiPort + "/icons?filter=" + filter, {headers} )
    .subscribe(dataIcons => {
      this.SpinnerService.hide();
      this.icons = dataIcons;

      // If updating structure, load its data
      if (this.uuid) {
        this.getStructure();
      }
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Get structure details
  async getStructure() {
    this.SpinnerService.show();

    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Get structure data
    if (this.uuid) {
      this.http.get<Structure>(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid, {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();
        this.formData.name = data.name;
        this.formData.address = data.address;
        this.formData.city = data.city;
        this.formData.email = data.email;
        this.formData.latitude = data.latitude;
        this.formData.longitude = data.longitude;
        this.formData.phone = data.phoneNumber;
        this.formData.phonePrefix = data.phoneNumberPrefix;
        this.formData.website = data.website;
        this.formData.icon = data.idIcon;
        this.publicationStatus = data.publicationStatus;

        if (this.publicationStatus == 'requestPublication') {
          this.publicationStatusClass = 'text-warning';
        } else if (this.publicationStatus == 'modification')  {
          this.publicationStatusClass = 'text-primary';
        } else if (this.publicationStatus == 'published') {
          this.publicationStatusClass = 'text-success';
        } else if (this.publicationStatus == 'rejected') {
          this.publicationStatusClass = 'text-danger';
        }

        this.rejectionMessage = data.rejectionDescription;
        this.getStructureLanguages();

      }, error => {
        this.SpinnerService.hide();
        this.showExceptionMessage(error);
      });
    }
  }

  // Get structure languages
  async getStructureLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Array<StructureLanguage>>(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid + "/structures-languages", {headers} )
    .subscribe(dataLangs=> {
      dataLangs.forEach(elementLang => {
        let desc = "";
        if (elementLang.description) {
          desc = elementLang.description;
        }
        this.formData.text[elementLang.language] = desc;
      });
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Get structure categories
  async getStructureCategories() {
    this.SpinnerService.show();
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

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
        "skip": 0, \
        "order": ["identifier"] \
      }';

    // Get categories list
    this.http.get<Array<Category>>(environment.apiUrl + environment.apiPort + "/categories?filter=" + filter, {headers} )
    .subscribe(dataCategories => {
      // Get categories associated to the structure
      this.http.get<Array<StructureCategory>>(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid + '/structures-categories', {headers} )
      .subscribe(dataStructureCategories => {
        dataCategories.forEach(elementCategory => {
          let categoriesList: FormDataStructureCategories;

          categoriesList = {
            idStructureCategory: '',
            idCategory: elementCategory.idCategory,
            identifier: elementCategory.identifier,
            value: false
          }

          dataStructureCategories.forEach(elementStructureCategory => {
            if (elementStructureCategory.idCategory == elementCategory.idCategory) {
              categoriesList.value = true;
              categoriesList.idStructureCategory = elementStructureCategory.idStructureCategory;
            }
          });

          this.structureCategories.push(categoriesList);
        });
      }, error => {
        this.showExceptionMessage(error);
      });
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Get structure images
  async getStructureImages() {
    this.SpinnerService.show();

    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Array<StructureImage>>(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid + "/structures-images", {headers} )
    .subscribe(dataImage=> {
      this.structureImages = dataImage;
      let x = 0;

      this.structureImages.forEach(element => {
        this.structureImages[x].filename = encodeURIComponent(this.structureImages[x].filename);
        x++;
      });

      this.SpinnerService.hide();
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });
  }

  async saveStructure() {
    this.errorsDescriptions = [];

    // Check if entered the name
    if (!this.formData.name) {
      this.errorsDescriptions.push(this.translate.instant('Please enter the structure name'));
    }

    // Check if entered the address
    if (!this.formData.address) {
      this.errorsDescriptions.push(this.translate.instant('Please enter the structure address'));
    }

    // Check if entered the city
    if (!this.formData.address) {
      this.errorsDescriptions.push(this.translate.instant('Please enter the structure city'));
    }

    // Check if selected the map position
    if (!this.formData.latitude || !this.formData.longitude) {
      this.errorsDescriptions.push(this.translate.instant('Please set the structure location on the map'));
    }

    // Check if entered the icon
    if (!this.formData.icon) {
      this.errorsDescriptions.push(this.translate.instant('Please select the structure icon'));
    }

    // Check if there are no errors
    if (this.errorsDescriptions.length === 0) {
      this.SpinnerService.show();

      // Data save
      if (!this.formData.latitude) {
        this.formData.latitude = 0;
      }
      if (!this.formData.longitude) {
        this.formData.longitude = 0;
      }

      let postParams = {
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

      // Check if update or insert
      if (this.uuid) {
        // Update the structure
        this.http.patch(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid, postParams, {headers} )
        .subscribe(async data => {
          await this.saveStructureLanguages();

          this.SpinnerService.hide();

          this.showInfoMessage(this.translate.instant('Structure saved'),this.translate.instant('The information has been saved.'));
          if (this.userType == 'operator') {
            this.publicationStatus = 'modification';
            this.publicationStatusClass = 'text-primary';
            this.rejectionMessage = '';
          }
        }, error => {
          this.SpinnerService.hide();

          this.showExceptionMessage(error);
        });
      } else {
        // Insert the structure
        this.http.post<Structure>(environment.apiUrl + environment.apiPort + "/structures", postParams, {headers} )
        .subscribe(async data => {
          this.uuid = data.idStructure;

          await this.saveStructureLanguages();

          this.SpinnerService.hide();

          this.router.navigateByUrl('structure-details/' + this.uuid + '?action=success');
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

  // Save structure languages
  async saveStructureLanguages() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Update the structure languages
    this.languages.forEach(element => {
      let postParams = {
        idStructure: this.uuid,
        language: element.value,
        description: this.formData.text[element.value]
      };

      this.http.post(environment.apiUrl + environment.apiPort + "/structures-languages", postParams, {headers} )
      .subscribe(subdata=> {
      }, error => {
        this.showExceptionMessage(error);
      });
    });
  }

  // Switch language
  async switchTextarea(lang) {
    this.currentLanguage = lang;
  }

  // Delete structure
  deleteStructure(idStructure) {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(environment.apiUrl + environment.apiPort + "/structures/" + idStructure, {headers} )
    .subscribe(data=> {
      this.SpinnerService.hide();

      this.router.navigateByUrl('/structures');
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });
  }

  // Set the structure category association
  setStructureCategoryStatus(idCategory, value, idStructureCategory) {
    let x = 0;

    this.structureCategories.forEach(element => {
      if (element.idCategory == idCategory) {
        if (value == true) {
          this.structureCategories[x].idStructureCategory = '';
          this.structureCategories[x].value = false;
          this.deleteStructureCategory(idStructureCategory);
        } else {
          this.structureCategories[x].value = true;
          this.saveStructureCategory(idCategory);
        }
      }

      x++;
    });
  }

  // Save the structure category association
  saveStructureCategory(idCategory) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    let postParams = {
      idCategory: idCategory,
      idStructure: this.uuid
    };

    this.http.post<StructureCategory>(environment.apiUrl + environment.apiPort + "/structures-categories", postParams, {headers} )
    .subscribe(data => {
      if (data.idStructureCategory) {
        let x = 0;

        this.structureCategories.forEach(element => {
          if (element.idCategory == data.idCategory) {
            this.structureCategories[x].idStructureCategory = data.idStructureCategory;
          }

          x++;
        });
      }
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Delete the structure category association
  deleteStructureCategory(idStructureCategory) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(environment.apiUrl + environment.apiPort + "/structures-categories/" + idStructureCategory, {headers} )
    .subscribe(data => {
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Structure image select
  structureImageSelect(event) {
    const file = event.srcElement.files[0];
    this.structureImageSrc = window.URL.createObjectURL(file);

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('profile').setValue(file);
      let element:HTMLElement = document.getElementById('upload-submit') as HTMLElement;
      element.click();
    }
  }

  // Structure image submit
  structureImageSubmit() {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    const formData = new FormData();
    formData.append('file', this.uploadForm.get('profile').value);

    this.http.post(environment.apiUrl + environment.apiPort + "/structures-images/" + this.uuid, formData, {headers})
    .subscribe(res => {
      this.SpinnerService.hide();

      this.structureImageSrc = '';
      this.getStructureImages();
    }, error => {
      this.SpinnerService.hide();
      let code = error.status;

      switch (code) {
        case 400:
          this.showErrorMessage(
            this.translate.instant('Error uploading image'),
            this.translate.instant('Please select a JPEG file.')
          );
          break;

        case 409:
          this.showErrorMessage(
            this.translate.instant('Error uploading image'),
            this.translate.instant('An image with this name already exists. Check if you have already uploaded it, or rename the file.')
          );
          break;

        default:
          this.showExceptionMessage(error);
          break;
      }
    });
  }

  // Ask delete structure image
  structureImageAskDelete(idStructureImage) {
    this.idStructureImageDelete = idStructureImage;
    this.modalDeleteImage.show();
  }

  // Delete the structure image
  structureImageDelete(idStructureImage) {
    this.SpinnerService.show();

    this.modalDeleteImage.hide();
    this.idStructureImageDelete = '';

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(environment.apiUrl + environment.apiPort + "/structures-images/" + idStructureImage, {headers} )
    .subscribe(data=> {
      this.SpinnerService.hide();

      this.getStructureImages();
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });
  }

  // Set the structure marker on the map
  setStructureMarker(event) {
    this.formData.latitude = event.coords.lat;
    this.formData.longitude = event.coords.lng;
  }

  // Find structure address
  findStructureAddress() {
    if (this.formData.address && this.formData.city) {
      let address = this.formData.address + ', ' + this.formData.city;
      this.addressToCoordinates(address);
    } else {
      this.showErrorMessage(
        this.translate.instant('Unable geocoding'),
        this.translate.instant('Enter the address and the city to search the position on the map.')
      );
    }
  }

  // Geocoding: convert address to coordinates
  addressToCoordinates(address) {
    this.SpinnerService.show();

    this.loadingCoordinates = true;

    this.geocodeService.geocodeAddress(address)
    .subscribe((location: Location) => {
        this.SpinnerService.hide();

        this.formData.latitude = location.lat;
        this.formData.longitude = location.lng;
        this.loadingCoordinates = false;
        this.ref.detectChanges();
      }
    );

    this.SpinnerService.hide();
  }

  // Request Publication
  async requestPublication() {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    let postParams = { };

    // Update the structure
    this.http.post(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid + '/request-publication', postParams, {headers} )
    .subscribe(async data => {
      var response: any = data;
      var response_code: number = parseInt(response.messageOutcome.code);
      var response_message = response.messageOutcome.message;

      this.SpinnerService.hide();

      switch (response_code) {
        case 10:
          this.showErrorMessage(
            this.translate.instant('Error'),
            this.translate.instant('Structure does not exist'),
          );
          break;

        case 201: case 202:
          this.showInfoMessage(this.translate.instant('Publication request sent'),this.translate.instant('The publication request has been sent successfully.'));
          this.publicationStatus = 'requestPublication';
          this.publicationStatusClass = 'text-warning';
          this.rejectionMessage = '';
          break;

        default:
          this.showErrorMessage(this.translate.instant('Sorry'),this.translate.instant('The following error occurred') + ': ' + response_message);
          break;
      }
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });
  }

  // Publication
  async publicationStructure(publicationStatus = null, rejectionMessage = null) {
    this.rejectionMessage = '';

    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    let postParams = {
      publicationStatus: publicationStatus,
      rejectionMessage: rejectionMessage
    };

    // Update the structure
    this.http.post(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid + '/publication', postParams, {headers} )
    .subscribe(async data => {
      var response: any = data;
      var response_code: number = parseInt(response.messageOutcome.code);
      var response_message = response.messageOutcome.message;

      this.SpinnerService.hide();

      this.modalReject.hide();

      switch (response_code) {
        case 10:
          this.showErrorMessage(
            this.translate.instant('Error'),
            this.translate.instant('Structure does not exist'),
          );
          break;

        case 201: case 202:
          if (publicationStatus == 'published') {
            this.showInfoMessage(this.translate.instant('Publication completed'),this.translate.instant('The structure publication has been confirmed successfully.'));
            this.publicationStatus = 'published';
            this.publicationStatusClass = 'text-success';
          } else if (publicationStatus == 'rejected') {
            this.showInfoMessage(this.translate.instant('Structure Rejected'),this.translate.instant('The structure publication has been rejected successfully.'));
            this.publicationStatus = 'rejected';
            this.publicationStatusClass = 'text-danger';
            this.rejectionMessage = this.formReject.description;
          }
          break;

        default:
          this.showErrorMessage(
            this.translate.instant('Error'),
            response_message
          );
          break;
      }
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });

  }

  // Publish
  async publishStructure() {
    this.publicationStructure('published');
  }

  // Open Reject Modal
  async rejectStructure() {
    this.formReject.description = '';
    this.modalReject.show();
  }

  // Reject
  async confirmRejectStructure() {
    this.publicationStructure('rejected',this.formReject.description);
  }

  // Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

  // Info message
  showInfoMessage(title: string, description: string): void {
    this.messageInfo.title = title;
    this.messageInfo.description = description;
    this.modalInfo.show();
  }

  // Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
