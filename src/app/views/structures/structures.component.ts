import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FilterSearch, MessageException, MessageError, QuickSearch, Structure } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-structures',
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.css']
})

export class StructuresComponent implements OnInit {
  token: string;
  idOrganization: string;
  permissions: string;
  formFilter: QuickSearch;
  formSearch: FilterSearch;
  filteredStructures: Array<Structure>;
  allStructures: Array<Structure>;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  prefixes: string[];
  userType: string;
  selectedItemsList = [];
  checkedIDs = [];
  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: MessageError;
  errorsDescriptions: string[];
  @ViewChild('modalExport') public modalExport: ModalDirective;
  @ViewChild('modalImport') public modalImport: ModalDirective;

  action_delete: boolean;
  current_delete: number;
  total_delete: number;
  filename: string;
  fileSrc: string;
  uploadForm: FormGroup;
  importResponseColor: string;
  importResponseMessage: string;

  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
  ) {
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
    this.permissions = localStorage.getItem('permissions');
    this.userType = localStorage.getItem('userType');
    this.filteredStructures = [];
    this.allStructures = [];
    this.messageException = environment.messageExceptionInit;
    this.formFilter = { search: '' };
    this.formSearch = { city: '', phonePrefix: '' };
    this.prefixes = ['+1', '+1 242', '+1 246', '+1 264', '+1 268', '+1 284', '+1 345', '+1 441', '+1 473', '+1 649', '+1 664', '+1 721', '+1 758', '+1 767', '+1 784', '+1 787', '+1 809', '+1 829', '+1 849', '+1 868', '+1 869', '+1 876', '+20', '+210', '+211', '+212', '+213', '+214', '+215', '+216', '+217', '+218', '+219', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+259', '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269', '+27', '+290', '+291', '+297', '+298', '+299', '+30', '+31', '+32', '+33', '+34', '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', '+36', '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+379', '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+388', '+389', '+39', '+40', '+41', '+420', '+421', '+423', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', '+509', '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', '+599 3', '+599 4', '+599 7', '+599 9', '+60', '+61', '+62', '+63', '+64', '+65', '+66', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', '+680', '+681', '+682', '+683', '+685', '+686', '+687', '+688', '+689', '+690', '+691', '+692', '+7', '+800', '+808', '+81', '+82', '+84', '+850', '+852', '+853', '+855', '+856', '+86', '+880', '+886', '+90', '+91', '+92', '+93', '+94', '+95', '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', '+972', '+973', '+974', '+975', '+976', '+977', '+98', '+992', '+993', '+994', '+995', '+996', '+998'];
    this.messageError = environment.messageErrorInit;
    this.action_delete = false;
    this.filename = '';
  }

  // Page init
  ngOnInit(): void {
    if (this.idOrganization || this.permissions.includes('GeneralStructuresManagement')) {
      if (this.userType !== 'gppOperator') {
        this.loadStructures();
      }
    }
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });
  }

  // Structures list
  async loadStructures(city = null, prefix = null) {
    this.SpinnerService.show();
    if (prefix) {
      prefix = prefix.replace('+','%2B');
    }
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Filters
    let cityQuery = '';
    let prefixQuery = '';
    let preString = '';
    if (city) {
      prefixQuery = '"city": { "ilike" : "%25' + city + '%25" }';
      preString = ',';
    }
    if (prefix) {
      prefixQuery = prefixQuery + preString + '"phoneNumberPrefix": "' + prefix + '" '
    }
    let where = '"where": { \ ' +
    cityQuery +
    prefixQuery +
    '},';
    let filter = ' \
      { \
        "fields" : { \
          "idStructure": true, \
          "idOrganization": false, \
          "organizationname": false, \
          "alias": true, \
          "structurename": true, \
          "address": true, \
          "city": true, \
          "latitude": false, \
          "longitude": false, \
          "email": true, \
          "phoneNumberPrefix": true, \
          "phoneNumber": true, \
          "website": true, \
          "idIcon": false, \
          "iconimage":true, \
          "iconmarker":false \
        }, \ '
        + where +
        '"offset": 0, \
        "skip": 0, \
        "order": ["structurename"] \
      }';
    // console.log(filter);
    // HTTP Request
    this.http.get<Array<Structure>>(environment.apiUrl + environment.apiPort + "/structures?filter=" + filter, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();
      this.allStructures = data;
      this.filteredStructures = data;
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Structures filter
  async filterStructures() {
    let search = this.formFilter.search;

    if (search) {
      this.filteredStructures = [];
      this.allStructures.forEach(element => {
        search = search.toLowerCase();
        let name = element.structurename.toLowerCase();
        let address = element.address.toLowerCase();
        let city = element.city.toLowerCase();
        let email = element.email.toLowerCase();
        if (name.includes(search) || address.includes(search) || city.includes(search) || email.includes(search)) {
          this.filteredStructures.push(element);
        }
      });
    } else {
      this.filteredStructures = this.allStructures;
    }
  }

  // Open structure details
  async structureDetails(id) {
    this.router.navigateByUrl('structure-details/' + id);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }

  onSubmit(form) {
    const prefix = form.value.phonePrefix;
    const city = form.value.city;
    this.loadStructures(city,prefix);
  }

  //on checkbox change
  changeSelection() {
   this.selectedItemsList = this.allStructures.filter((value, index) => {
    //return value.isChecked
   });
   this.checkedIDs = [];
   this.allStructures.forEach((value, index) => {
     if (value.isChecked) {
       this.checkedIDs.push(value.idStructure);
     }
   });
  }


  //Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

  deleteMultiple() {
    this.SpinnerService.show();
    if (this.checkedIDs.length == 0) {
      this.showErrorMessage(
        this.translate.instant('No Structure Selected'),
        this.translate.instant('Please select at least one Structure')
      );
      this.SpinnerService.hide();
      return false;
    } else {
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
      let length = this.checkedIDs.length;
      this.action_delete = true;
      this.total_delete = length;
      let x = 0;
      this.checkedIDs.forEach( element => {
        this.http.delete(environment.apiUrl + environment.apiPort + "/structures/" + element, {headers} )
        .subscribe(data=> {
          x++;
          this.current_delete = x;
        });
      });
      this.SpinnerService.hide();
    }
  }

  // Open Modal Import
  openImport() {
    this.importResponseColor = '';
    this.importResponseMessage = '';
    this.modalImport.show();
  }

  // Open Modal Export
  openExport() {
    this.filename = '';
    this.modalExport.show();
  }

  // Export Structures
  async ExportStructures() {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.post(environment.apiUrl + environment.apiPort + "/structures/export-excel", {}, {headers} )
    .subscribe(data => {
      this.SpinnerService.hide();
      var response: any = data;
      var response_code: number = parseInt(response.excelExportOutcome.code);
      var response_message = response.excelExportOutcome.message;
      switch (response_code) {
        case 202:
          this.filename = response.excelExportOutcome.filename;
          this.filename = this.filename.replace('public',environment.imagesUrl);
        break;
        default:
          this.messageException = { name : '', status : 1, statusText : this.translate.instant('Error'), message : response_message };
          this.modalExport.hide();
          this.modalException.show();
          break;
      }

    }, error => {
      this.SpinnerService.hide();
      this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
      this.modalExport.hide();
      this.modalException.show();
    });

  }

  // xlsx File select
  fileSelect(event) {
    const file = event.srcElement.files[0];
    this.fileSrc = window.URL.createObjectURL(file);

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('profile').setValue(file);
      //let element:HTMLElement = document.getElementById('upload-submit') as HTMLElement;
      //element.click();
    }
  }

  // Import xlsx File
  async ImportStructures() {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    const formData = new FormData();
    formData.append('file', this.uploadForm.get('profile').value);

    this.http.post(environment.apiUrl + environment.apiPort + "/structures/import-excel", formData, {headers} )
    .subscribe(data => {
      this.SpinnerService.hide();
      var response: any = data;
      if (response.code == 202) {
        this.importResponseColor = '-success';
        this.importResponseMessage = this.translate.instant('Import completed successfully!');
      } else if (response.code == 10) {
        this.importResponseColor = '-danger';
        this.importResponseMessage = response.message.split('-').join('<br />-');
      }
     }, error => {
      this.SpinnerService.hide();
      this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
      this.modalImport.hide();
      this.modalException.show();
    });

  }

}
