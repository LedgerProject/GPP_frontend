import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageException } from '../../services/models';
import { environment } from '../../../environments/environment';

interface ResetPassword {
  newPassword: string;
  confirmNewPassword: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordToken: string;
  formData: ResetPassword;
  messageException: MessageException;
  alert_class: string;
  constructor(
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private route: ActivatedRoute
  ) {
    this.messageException = environment.messageExceptionInit;
    this.route.queryParams.subscribe(params => {
      this.resetPasswordToken = params['confirm'];
    });
    this.alert_class = '';
    this.formData = {
      newPassword: '',
      confirmNewPassword: ''
    };
  }

  ngOnInit(): void {

  }

  async requestResetPassword() {

    if (this.formData.newPassword.length == 0) {
      this.messageException = {
        name : '',
        status : 10,
        statusText : this.translate.instant('Missing New Password'),
        message : this.translate.instant('New Password is empty')
      };
      this.alert_class = 'warning';
    } else if (this.formData.confirmNewPassword.length == 0) {
      this.messageException = {
        name : '',
        status : 10,
        statusText : this.translate.instant('Missing Confirm New Password'),
        message : this.translate.instant('Confirm New Password is empty')
      };
      this.alert_class = 'warning';
    } else if (this.formData.confirmNewPassword != this.formData.newPassword) {
      this.messageException = {
        name : '',
        status : 10,
        statusText : this.translate.instant('Passwords not match'),
        message : this.translate.instant('New Password does not match New Password Confirm')
      };
      this.alert_class = 'warning';
    } else {

    let postParams = {
      resetPasswordToken: this.resetPasswordToken,
      newPassword: this.formData.newPassword
    }

    let headers = new HttpHeaders().set("Content-Type", "application/json");

    this.http.post(environment.apiUrl + environment.apiPort + "/user/confirm-reset-password", postParams, {headers})
    .subscribe(data => {
      var response: any = data;
      var response_code: number = parseInt(response.confirmResetPasswordOutcome.code);
      var response_message = response.confirmResetPasswordOutcome.message;
      switch (response_code) {
        case 10:
          this.messageException = {
            name : '',
            status : 10,
            statusText : this.translate.instant('Sorry'),
            message : this.translate.instant('Reset Password token not exists')
          };
          this.alert_class = 'warning';
        break;
        case 11:
          this.messageException = {
            name : '',
            status : 11,
            statusText : this.translate.instant('Sorry'),
            message : this.translate.instant('Reset Password token is empty')
          };
          this.alert_class = 'warning';
        break;
        case 20:
          this.messageException = {
            name : '',
            status : 20,
            statusText : this.translate.instant('Sorry'),
            message : this.translate.instant('New password at least 8 characters')
          };
          this.alert_class = 'warning';
        break;
        case 201: case 202:
          this.messageException = {
            name : '',
            status : 202,
            statusText : this.translate.instant('Congratulations!'),
            message : this.translate.instant('Password updated successfully')
          };
          this.alert_class = 'success';
        break;
        default:
          this.messageException = {
            name : '',
            status : 1,
            statusText : this.translate.instant('Error'),
            message : response_message
          };
          this.alert_class = 'warning';
          break;
      }

    }, error => {
      this.alert_class = 'danger';
      this.messageException = error;
    });
  }
 }

}
