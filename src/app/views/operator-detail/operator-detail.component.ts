import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, MessageError, User } from '../../services/models';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-operator-detail',
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.css']
})

export class OperatorDetailComponent implements OnInit {
  token: string;
  @Input() idUser: string;
  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  messageError: MessageError;
  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  errorsDescriptions: string[];

  operator: any;
  idOrganization: string;
  permissions: string;
  permission_OrganizationAdministrator: boolean;
  permission_OrganizationUsersManagement: boolean;
  permission_OrganizationStructuresManagement: boolean;
  permission_Admin: boolean;
  userType: string;
  myIdUser: string;

  constructor(
    private _Activatedroute: ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('token');
    this.userType = localStorage.getItem('userType');
    this.myIdUser = localStorage.getItem('idUser');

    this.idUser = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.operator = {
      idUser: '',
      userType: '',
      firstName: '',
      lastName: '',
      email: '',
      //permissions: [],
      idNationality: '',
      gender: '',
      birthday: ''
    };
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
    this.errorsDescriptions = [];
    this.permission_OrganizationAdministrator = false;
    this.permission_OrganizationUsersManagement = false;
    this.permission_OrganizationStructuresManagement = false;
    this.permission_Admin = false;
    this.permissions = '';
  }

  // Page init
  ngOnInit(): void {
    this.getOperator();
  }

  // Get operator details
  async getOperator() {

    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // HTTP Request
    this.http.get<Array<User>>(environment.apiUrl + environment.apiPort + "/users/" + this.idUser, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();
      this.operator = data;
      if (this.userType == 'gppOperator') {
        if (this.operator.userType == 'gppOperator') {
          this.permission_Admin = true;
        } else {
          this.permission_Admin = false;
        }
      } else {
        if (this.operator.organizationUser) {
          if (this.operator.organizationUser[0]) {
            const user_permissions: [] = this.operator.organizationUser[0].permissions;
            user_permissions.forEach(element => {
              switch (element) {
                case 'OrganizationAdministrator':
                this.permission_OrganizationAdministrator = true;
                break;
                case 'OrganizationUsersManagement':
                this.permission_OrganizationUsersManagement = true;
                break;
                case 'OrganizationStructuresManagement':
                this.permission_OrganizationStructuresManagement = true;
                break;
              }

              this.permissions = '';
              if (this.permission_OrganizationAdministrator == true) {
                this.permissions = 'OrganizationAdministrator';
              } else {
                if (this.permission_OrganizationUsersManagement == true) {
                  this.permissions = 'OrganizationUsersManagement';
                }
                if (this.permission_OrganizationStructuresManagement == true) {
                  if (this.permissions) {
                    this.permissions = this.permissions + ',';
                  }
                  this.permissions = this.permissions + 'OrganizationStructuresManagement';
                }
              }

            });
          }
        }
      }
    }, error => {
      this.SpinnerService.hide();
      //console.log(error);
      this.showExceptionMessage(error);
    });
  }

  // Save operator permissions
  async saveOperatorPermissions() {
    this.SpinnerService.show();
    let postParams = {
      permissions: this.permissions
    };
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    // HTTP Request
    this.http.post(environment.apiUrl + environment.apiPort + "/user/" + this.idUser + "/change-permissions",postParams, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();
      //console.log(data);
      // var response: any = data;
      this.modalInfo.show();
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Remove operator from team
  async removeOperatorFromTeam() {
    this.SpinnerService.show();
    let postParams = {
      idUser: this.idUser
    };
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    // HTTP Request
    this.http.post(environment.apiUrl + environment.apiPort + "/user/remove-organization",postParams, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();
      //console.log(data);
      var response: any = data;

      var response_code: number = parseInt(response.removeOrganizationUserOutcome.code);
      var response_message:string = response.removeOrganizationUserOutcome.message;
      switch (response_code) {
        case 10: case 11:
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('User not exists')
          );
        break;
        case 12:
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('User is not an administrator')
          );
        break;
        case 13:
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('User is not in your organization')
          );
        break;
        case 20:
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('Cannot remove the last administrator from organization')
          );
        break;
        case 21:
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('Cannot remove an administrator')
          );
        break;
        case 201: case 202:
          this.modalInfo.show();
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

  // Save Admin
  async saveAdmin() {
    this.SpinnerService.show();
    let postParams = {
      idUser: this.idUser
    };
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    // HTTP Request
    let action = '';
    if (this.permission_Admin == true) {
      action = 'set-admin';
    } else {
      action = 'del-admin';
    }
    this.http.post(environment.apiUrl + environment.apiPort + "/user/"+action,postParams, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();
      //console.log(data);
      var response: any = data;

      var response_code: number;
      var response_message:string;
      if (action == 'set-admin') {
        response_code = parseInt(response.setAdminOutcome.code);
        response_message = response.setAdminOutcome.message;
      } else {
        response_code = parseInt(response.delAdminOutcome.code);
        response_message = response.delAdminOutcome.message;
      }
      switch (response_code) {
        case 10: case 11: case 14:
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('User not exists')
          );
        break;
        case 12:
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('Operator Email not confirmed')
          );
        break;
        case 14:
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('Operator Email not confirmed')
          );
        break;
        case 13:
          if (action == 'set-admin') {
            this.showErrorMessage(
              this.translate.instant('Sorry'),
              this.translate.instant('User is not an operator')
            );
          } else if (action == 'del-admin') {
            this.showErrorMessage(
              this.translate.instant('Sorry'),
              this.translate.instant('User is not an administrator')
            );
          }
        break;
        case 201: case 202:
          this.modalInfo.show();
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

  // Remove All Data
  async removeAllData() {
    this.SpinnerService.show();
    console.log('remove all data');
    this.SpinnerService.hide();
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

  setValue(value) {
    //console.log(value);
    this.permissions = '';
    if (value == 'OrganizationAdministrator') {
      this.permission_OrganizationUsersManagement = false;
      this.permission_OrganizationStructuresManagement = false;
    } else if (value == 'OrganizationUsersManagement') {
      this.permission_OrganizationAdministrator = false;
    } else if (value == 'OrganizationStructuresManagement') {
      this.permission_OrganizationAdministrator = false;
    }
    if (this.permission_OrganizationAdministrator == true) {
      this.permissions = 'OrganizationAdministrator';
    } else {
      if (this.permission_OrganizationUsersManagement == true) {
        this.permissions = 'OrganizationUsersManagement';
      }
      if (this.permission_OrganizationStructuresManagement == true) {
        if (this.permissions) {
          this.permissions = this.permissions + ',';
        }
        this.permissions = this.permissions + 'OrganizationStructuresManagement';
      }
    }
  }
}
