import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { MessageException } from '../../services/models';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
interface ForgotPassword {
  email: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './forgotpassword.component.html'
})

export class ForgotpasswordComponent implements OnInit {
  formData: ForgotPassword;
  formDataUser: any;
  messageException: MessageException;
  alert_class: string;
  user_type: string;
  constructor (
    private router: Router,
    private http:HttpClient,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.formData = {
      email: ''
    }
    this.formDataUser = {
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: ''
    }
    this.messageException = environment.messageExceptionInit;
    this.alert_class = '';
    this.user_type = '';
  }

  // Page init
  ngOnInit(): void {}

  // Request change password
  async requestChangePassword() {
    this.SpinnerService.show();
    let email = this.formData.email;

    if (!email) {
      this.messageException = {
        name : '',
        status : 422,
        statusText : this.translate.instant('Specify access data'),
        message : this.translate.instant('Enter your email')
      };
      this.SpinnerService.hide();
    } else {

      // this.user_type = 'user';

      if (this.user_type != 'user') {
      let postParams = {
        email: email,
      }

      let headers = new HttpHeaders().set("Content-Type", "application/json");

      this.http.post(environment.apiUrl + environment.apiPort + "/user/reset-password", postParams, {headers})
      .subscribe(data => {
        //console.log(data);
        this.SpinnerService.hide();
        var response: any = data;

        var response_code: number = parseInt(response.resetPasswordOutcome.code);
        var response_message:string = response.resetPasswordOutcome.message;
        switch (response_code) {
          case 10:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Email not exists')
            };
            this.alert_class = 'warning';
          break;
          case 11:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Email is empty')
            };
            this.alert_class = 'warning';
          break;
          case 20:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Request already done in the last 24 hours')
            };
            this.alert_class = 'warning';
          break;
          case 30:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Error sending e-mail')
            };
            this.alert_class = 'warning';
          break;
          case 202:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Congratulations!'),
              message : this.translate.instant('Password recovery link sent successfully to your email address')
            };
            this.alert_class = 'success';
          break;
          default:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Error'),
              message : response_message
            };
            this.alert_class = 'success';
            break;
        }


      }, error => {
        this.SpinnerService.hide();
        this.messageException = error;
        this.alert_class = 'danger';
      });
     } else {
      this.SpinnerService.hide();
     }
    }
  }

  async requestChangePasswordUser() {
    let email = this.formData.email;
    let answer1 = this.formDataUser.answer1;
    let answer2 = this.formDataUser.answer2;
    let answer3 = this.formDataUser.answer3;
    let answer4 = this.formDataUser.answer4;
    let answer5 = this.formDataUser.answer5;

    let postParams = {
      email: email,
      answer1: answer1,
      answer2: answer2,
      answer3: answer3,
      answer4: answer4,
      answer5: answer5
    }
    console.log(postParams);
    /*let headers = new HttpHeaders().set("Content-Type", "application/json");

    this.http.post(environment.apiUrl + environment.apiPort + "/user/reset-password", postParams, {headers})
    .subscribe(data => {

    }, error => {
      this.messageException = error;
      this.alert_class = 'danger';
    });*/

  }

}
