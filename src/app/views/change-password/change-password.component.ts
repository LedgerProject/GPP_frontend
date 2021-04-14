import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, MessageError } from '../../services/models';
import { NgxSpinnerService } from "ngx-spinner";
interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  formData: ChangePassword;
  token: string;

  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  messageError: MessageError;

  constructor (
    private router: Router,
    private http:HttpClient,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
    ) {
    this.formData = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    };
    this.token = localStorage.getItem('token');
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
  }

  ngOnInit(): void {
  }

  async changePassword() {
    this.SpinnerService.show();
    if (this.formData.currentPassword.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing Current Password'),
        this.translate.instant('Current Password is empty')
      );
      this.SpinnerService.hide();
    } else if (this.formData.newPassword.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing New Password'),
        this.translate.instant('New Password is empty')
      );
      this.SpinnerService.hide();
    } else if (this.formData.confirmNewPassword.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing Confirm New Password'),
        this.translate.instant('Confirm New Password is empty')
      );
      this.SpinnerService.hide();
    } else if (this.formData.confirmNewPassword != this.formData.newPassword) {
      this.showErrorMessage(
        this.translate.instant('Passwords not match'),
        this.translate.instant('New Password does not match New Password Confirm')
      );
      this.SpinnerService.hide();
    } else {

      let postParams = {
        currentPassword: this.formData.currentPassword,
        newPassword: this.formData.newPassword
      };
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      // HTTP Request
      this.http.post(environment.apiUrl + environment.apiPort + "/user/change-password",postParams, {headers})
      .subscribe(data => {
        this.SpinnerService.hide();
        var response: any = data;
        var response_code: number = parseInt(response.changePasswordOutcome.code);
        var response_message = response.changePasswordOutcome.message;
        switch (response_code) {
          case 10:
            this.showErrorMessage(
              this.translate.instant('Sorry'),
              this.translate.instant('Current password is wrong')
            );
          break;
          case 20:
            this.showErrorMessage(
              this.translate.instant('Sorry'),
              this.translate.instant('New password at least 8 characters')
            );
          break;
          case 201: case 202:
            this.modalInfo.show();
            this.formData.newPassword = '';
            this.formData.confirmNewPassword = '';
            this.formData.currentPassword = '';
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
        let code = error.status;
        if (code == 401) {
          this.showErrorMessage(
            this.translate.instant('Sorry'),
            this.translate.instant('Current password is wrong')
          );
        } else {
          this.showExceptionMessage(error);
        }
      });

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
}
