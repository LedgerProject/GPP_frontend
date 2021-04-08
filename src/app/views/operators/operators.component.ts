import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, QuickSearch, User } from '../../services/models';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css']
})

export class OperatorsComponent implements OnInit {
  token: string;
  idOrganization: string;
  permissions: string;
  formFilter: QuickSearch;
  formSearch: any;
  userType: string;
  filteredOperators: Array<User>;
  allOperators: Array<User>;
  idUser: string;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  levels: {};

  constructor (
    private router: Router,
    private http:HttpClient,
    public translate: TranslateService,
  ) {
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
    this.permissions = localStorage.getItem('permissions');
    this.userType = localStorage.getItem('userType');
    this.idUser = localStorage.getItem('idUser');
    this.filteredOperators = [];
    this.allOperators = [];
    this.messageException = environment.messageExceptionInit;
    this.formFilter = { search: '' };
    this.formSearch = { firstName: '', lastName: '', email: ''};
    this.levels = {
      'OrganizationAdministrator': this.translate.instant('Administrator'),
      'OrganizationUsersManagement': this.translate.instant('User Management'),
      'OrganizationStructuresManagement': this.translate.instant('Structures Management')
    };
  }

  // Page init
  ngOnInit(): void {
    if (this.idOrganization || this.permissions.includes('GeneralUsersManagement')) {
      if (this.userType !== 'gppOperator') {
        this.loadOperators();
      }
    }
  }

  // Operators list
  async loadOperators(lastName = null, firstName = null, email = null) {
    /*this.http.get<Array<User>>("assets/api/operators.json")
    .subscribe(data => {
      this.allOperators = data;
      this.filteredOperators = this.allOperators;
    }, error => {
      this.showExceptionMessage(error);
    });*/
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Filters
    let firstnameQuery = '';
    let lastnameQuery = '';
    let emailQuery = '';
    let preString = '';
    if (lastName) {
      lastnameQuery = '"lastName": "' + lastName + '" ';
      preString = ',';
    }
    if (firstName) {
      firstnameQuery = firstnameQuery + preString + '"firstName": "' + firstName + '" ';
      preString = ',';
    }
    if (email) {
      emailQuery = emailQuery + preString + '"email": "' + email + '" ';
    }
    let where = '';
    if (lastName || firstName || email) {
    where = '"where": { \ ' +
    lastnameQuery +
    firstnameQuery +
    emailQuery +
    '},';
    }

    let filter = ' \
      { \
        "fields" : { \
          "idUser": true, \
          "userType": true, \
          "firstName": true, \
          "lastName": true, \
          "email": true, \
          "emailConfirmed": false, \
          "password": false, \
          "passwordRecoveryToken": false, \
          "passwordRecoveryDate": false, \
          "idNationality": false, \
          "gender": false, \
          "birthday": false \
        }, \
        "include": [ \
          {"relation": "organizationUser"} \
        ], '
        + where +
        '"offset": 0, \
        "skip": 0, \
        "order": ["lastName"] \
      }';
    // HTTP Request
    this.http.get<Array<User>>(environment.apiUrl + environment.apiPort + "/users?filter=" + filter, {headers})
    .subscribe(data => {
      let data_without_idUser: any = data;
      data_without_idUser.forEach( (element,index) => {
        if (element.idUser == this.idUser) {
          data_without_idUser.splice(index, 1);
        }
      });
      this.allOperators = data_without_idUser;
      this.filteredOperators = this.allOperators;
    }, error => {
      this.showExceptionMessage(error);
    });

  }

  // Operators filter
  async filterOperators() {
    let search = this.formFilter.search;

    if (search) {
      this.filteredOperators = [];
      this.allOperators.forEach(element => {
        search = search.toLowerCase();
        let firstName = element.firstName.toLowerCase();
        let lastName = element.lastName.toLowerCase();
        let email = element.email.toLowerCase();
        let fullName = firstName + ' ' + lastName;

        if (firstName.includes(search) || lastName.includes(search) || email.includes(search) || fullName.includes(search)) {
          this.filteredOperators.push(element);
        }
      });
    } else {
      this.filteredOperators = this.allOperators;
    }
  }

  // Open operator details
  async operatorDetails(uuid) {
    this.router.navigateByUrl('operator-details/' + uuid);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }

  onSubmit() {
    const lastName = this.formSearch.lastName;
    const firstName = this.formSearch.firstName;
    const email = this.formSearch.email;
    this.loadOperators(lastName,firstName,email);
  }
}
