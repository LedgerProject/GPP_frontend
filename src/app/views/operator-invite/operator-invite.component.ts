import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, MessageError, User } from '../../services/models';
import { NgxSpinnerService } from "ngx-spinner";

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
  idUser: string;
  token: string;
  results: any;
  permissions: string;
  permissionOrganizationAdministrator: boolean;
  permissionOrganizationUsersManagement: boolean;
  permissionOrganizationStructuresManagement: boolean;
  permissionAdmin: boolean;
  stringMatch: string;
  myIdUser : string;
  messageException: MessageException;
  messageError: MessageError;

  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;

  constructor (
    private http:HttpClient,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
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
    this.permissionOrganizationAdministrator = false;
    this.permissionOrganizationUsersManagement = false;
    this.permissionOrganizationStructuresManagement = false;
    this.permissionAdmin = false;
    this.permissions = '';
    this.stringMatch = '';
    this.idUser = '';
    this.myIdUser = localStorage.getItem('idUser');
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
  }

  // Page init
  ngOnInit(): void {}

  // Invite operator
  async inviteOperator() {
    if (this.formData.textInvitation.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing Invitation text'),
        this.translate.instant('Invitation text is empty.')
      );
    } else if (this.idUser == '') {
      this.showErrorMessage(
        this.translate.instant('Missing Operator'),
        this.translate.instant('Please Select an Operator')
      );
    } else if (this.permissions == '') {
      this.showErrorMessage(
        this.translate.instant('Missing Permissions'),
        this.translate.instant('Please Check Permissions')
      );
    } else {
      this.SpinnerService.show();

      let postParams = {
        idUser: this.idUser,
        invitationMessage: this.formData.textInvitation,
        permissions: this.permissions
      };

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      // HTTP Request
      this.http.post(environment.apiUrl + environment.apiPort + "/user/invite-organization",postParams, {headers})
      .subscribe(data => {
        this.SpinnerService.hide();

        this.modalInfo.show();

        // Reset forms
        this.formData.textInvitation = '';
        this.stringMatch = '';
        this.idUser = '';
        this.permissions = '';
        this.permissionOrganizationUsersManagement = false;
        this.permissionOrganizationStructuresManagement = false;
        this.permissionOrganizationAdministrator = false;
        this.formSearch.findOperator = '';
        this.isSearching = false;
        this.results = [];
      }, error => {
        this.SpinnerService.hide();
        this.showExceptionMessage(error);
      });
    }
  }

  // Search operator
  async searchOperator(event) {
    this.stringMatch = '';
    this.idUser = '';
    let findOperator = this.formSearch.findOperator;

    if (findOperator.length >= 3) {
      this.SpinnerService.show();

      this.isSearching = true;

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      // HTTP Request
      this.http.get<Array<User>>(environment.apiUrl + environment.apiPort + "/users/invite/" + findOperator + "/10", {headers})
      .subscribe(data => {
        this.SpinnerService.hide();

        this.isSearching = false;
        let data_without_idUser: any = data;

        data_without_idUser.forEach( (element,index) => {
          if (element.idUser == this.myIdUser) {
            data_without_idUser.splice(index, 1);
          }
        });

        this.results = data_without_idUser;
      }, error => {
        this.SpinnerService.hide();

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

  //Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

  selectOperator(value) {
    this.formSearch.findOperator = value;
    this.stringMatch = value;
    var find_email = value.match(/\<(.*?)\>/);
    var email = '';

    if (find_email) {
      email = find_email[1];
    }

    this.results.forEach(element => {
      if (element.email == email) {
        this.idUser = element.idUser;
      }
    });

    this.results = [];
  }

  setValue(value) {
    this.permissions = '';

    if (value == 'OrganizationAdministrator') {
      this.permissionOrganizationUsersManagement = false;
      this.permissionOrganizationStructuresManagement = false;
    } else if (value == 'OrganizationUsersManagement') {
      this.permissionOrganizationAdministrator = false;
    } else if (value == 'OrganizationStructuresManagement') {
      this.permissionOrganizationAdministrator = false;
    }

    if (this.permissionOrganizationAdministrator == true) {
      this.permissions = 'OrganizationAdministrator';
    } else {
      if (this.permissionOrganizationUsersManagement == true) {
        this.permissions = 'OrganizationUsersManagement';
      }

      if (this.permissionOrganizationStructuresManagement == true) {
        if (this.permissions) {
          this.permissions = this.permissions + ',';
        }

        this.permissions = this.permissions + 'OrganizationStructuresManagement';
      }
    }
  }
}
