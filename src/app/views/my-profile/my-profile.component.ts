import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, MessageError, User } from '../../services/models';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})

export class MyProfileComponent implements OnInit {
  formData: any;
  token: string;
  lang: string;
  userType: string;
  nationality_options: any;
  @Input() idUser: string;
  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  messageError: MessageError;
  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  errorsDescriptions: string[];

  constructor (
    private http:HttpClient,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService,
    private router: Router,
    ) {
    this.token = localStorage.getItem('token');
    this.lang = localStorage.getItem('current_lang');
    this.idUser = localStorage.getItem('idUser');
    this.userType = localStorage.getItem('userType');
    this.formData = {
      idUser: this.idUser,
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
    this.nationality_options = [];
  }

  // Page init
  ngOnInit(): void {
    this.getOperator();
    this.getNationalities();
  }

  async getNationalities() {

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get(environment.apiUrl + environment.apiPort + `/nationalities?filter={`
    + `"order": ["identifier"],`
    + `"include":[`
     + `{"relation": "nationalityLanguage", "scope": {"where": {"language": "` + this.lang + `"}}}`
    + `]`
     + `}`, {headers})
    .subscribe(data => {
      this.nationality_options = data;
    }, error => {
      //this.showExceptionMessage(error);
    });
  }

  // Get operator details
  async getOperator() {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // HTTP Request
    this.http.get<Array<User>>(environment.apiUrl + environment.apiPort + "/users/" + this.idUser, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();
      this.formData = data;
      let bday = this.formData.birthday;
      if (bday) {
        this.formData.birthday = bday.substr(0,10);
      } else {
        this.formData.birthday = null;
      }
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Save profile data
  async saveProfile() {
    this.SpinnerService.show();
    if (this.formData.firstName.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing First Name'),
        this.translate.instant('First Name is empty')
      );
      this.SpinnerService.hide();
    } else if (this.formData.lastName.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing Last Name'),
        this.translate.instant('Last Name is empty')
      );
      this.SpinnerService.hide();
    } else {
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
      let postParams = {
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        //idNationality: this.formData.idNationality,
        //birthday: this.formData.birthday,
        //gender: this.formData.gender
      };
      if (this.formData.idNationality) {
        postParams['idNationality'] = this.formData.idNationality;
      }
      if (this.formData.gender) {
        postParams['gender'] = this.formData.gender;
      }
      if (this.formData.birthday) {
        postParams['birthday'] = this.formData.birthday +'T00:00:00.000Z';
      }
      this.http.patch(environment.apiUrl + environment.apiPort + "/users/" + this.idUser, postParams ,{headers})
      .subscribe(data => {
        this.SpinnerService.hide();
        this.modalInfo.show();
      }, error => {
        this.SpinnerService.hide();
        this.showExceptionMessage(error);
      });
    }
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

  askDelete() {
    this.modalDelete.show();
  }

  // Remove All Data
  async removeAllData() {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    this.http.delete(environment.apiUrl + environment.apiPort + "/users", {headers} )
    .subscribe(data => {
      this.SpinnerService.hide();
      localStorage.setItem('lastLoginEmail', '');
      localStorage.setItem('privateKey', '');
      localStorage.setItem('publicKey', '');
      localStorage.setItem('token', '');
      localStorage.setItem('idUser','');
      localStorage.setItem('name', '');
      localStorage.setItem('email', '');
      localStorage.setItem('permissions', '');
      localStorage.setItem('wallet', '');
      localStorage.setItem('userType', '');
      localStorage.setItem('idOrganization', '');
      localStorage.setItem('documents', '');
      localStorage.setItem('organizations', null);
      this.router.navigateByUrl('sign-in', { replaceUrl: true });
    }, error => {
      this.SpinnerService.hide();
      this.modalDelete.hide();
      this.showExceptionMessage(error);
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
