import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, User } from '../../services/models';
interface OperatorInvitation {
  email: '';
  textInvitation: '';
}

interface FindOperator {
  findOperator: '';
}

@Component({
  selector: 'app-operator-invite',
  templateUrl: './operator-invite.component.html',
  styleUrls: ['./operator-invite.component.css']
})

export class OperatorInviteComponent implements OnInit {
  formData: OperatorInvitation;
  formSearch: FindOperator;
  isSearching: boolean;
  token: string;
  results: any;
  messageException: MessageException;
  @ViewChild('modalException') public modalException: ModalDirective;

  constructor (
    private router: Router,
    private http:HttpClient
  ) {
    this.formData = {
      email: '',
      textInvitation: '',
    };
    this.formSearch = {
      findOperator: ''
    };
    this.isSearching = false;
    this.token = localStorage.getItem('token');
    this.results = [];
  }

  // Page init
  ngOnInit(): void {}

  // Invite operator
  async inviteOperator() {

  }

  // Search operator
  async searchOperator() {
    let findOperator = this.formSearch.findOperator;
    if (findOperator.length >= 3) {
      this.isSearching = true;

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
      let operatorQuery = '"email": { "ilike" : "%25' + findOperator + '%25" }';
      let userTypeQuery = ', "userType": "operator" ';
      let where = '"where": { \ ' +
      operatorQuery +
      userTypeQuery +
      '},';
      let filter = ' \
      { \
        "fields" : { \
          "idUser": true, \
          "userType": false, \
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
        ], \ '
        + where +
        '"offset": 0, \
        "limit": 10, \
        "skip": 0, \
        "order": ["lastName"] \
      }';
      // console.log(filter);
      // HTTP Request
      this.http.get<Array<User>>(environment.apiUrl + environment.apiPort + "/users?filter=" + filter, {headers})
      .subscribe(data => {
        this.isSearching = false;
        this.results = data;
        console.log(data);
      }, error => {
        this.showExceptionMessage(error);
      });


    } else {
      this.isSearching = false;
      this.results = [];
    }
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
