import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageException } from '../../services/models';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";

interface ForgotPassword {
  email: string,
  userType: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './forgotpassword.component.html'
})

export class ForgotpasswordComponent implements OnInit {
  formData: ForgotPassword;
  formDataUser: any;
  messageException: MessageException;
  alertClass: string;
  userType: string;
  questions: any;
  pbkdf: string;
  @Input() get_user_type: string;
  submitted: boolean;

  constructor (
    private http:HttpClient,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService,
    private _Activatedroute: ActivatedRoute
  ) {
    this.formData = {
      email: '',
      userType: '',
    }
    this.formDataUser = {
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
    }
    this.messageException = environment.messageExceptionInit;
    this.alertClass = '';
    this.userType = '';
    this.pbkdf = '';
    this.questions = [
      {'question': this.translate.instant('Where my parents met?') },
      {'question': this.translate.instant('What is your favorite artist?') },
      {'question': this.translate.instant('What is your home town?') },
      {'question': this.translate.instant('What is the name of your first teacher?') },
      {'question': this.translate.instant('What is your favorite dish?') }
    ];
    this.submitted = false;
  }

  // Page init
  ngOnInit(): void {
    this.get_user_type = this._Activatedroute.snapshot.queryParamMap.get("user_type");

    this._Activatedroute.queryParamMap.subscribe(queryParams => {
      this.get_user_type = queryParams.get("user_type")
    });

    if (this.get_user_type) {
      this.userType = this.get_user_type;
    }
  }

  // Request change password
  async requestChangePassword() {
    this.SpinnerService.show();
    let recovery = false;
    let postParams = {};
    this.messageException = { name : '', status : 0, statusText : '', message : '' };

    if (!this.formData.email) {
      this.messageException = {
        name : '',
        status : 422,
        statusText : this.translate.instant('Specify access data'),
        message : this.translate.instant('Enter your email')
      };
      this.alertClass = 'danger';
      this.SpinnerService.hide();
    } else {
      if (this.userType != 'user') {
        this.formData.userType = this.userType;

        postParams['email'] = this.formData.email;
        postParams['userType'] = this.formData.userType;
        postParams['answer1'] = '';
        postParams['answer2'] = '';
        postParams['answer3'] = '';
        postParams['answer4'] = '';
        postParams['answer5'] = '';
        recovery = true;
      } else {
        if (this.pbkdf && this.userType == 'user') {
          let answer1 = 'null';
          let answer2 = 'null';
          let answer3 = 'null';
          let answer4 = 'null';
          let answer5 = 'null';
          let count = 0;

          if (this.formDataUser.answer1) {
            answer1 = this.formDataUser.answer1;
            count++;
          }

          if (this.formDataUser.answer2) {
            answer2 = this.formDataUser.answer2;
            count++;
          }

          if (this.formDataUser.answer3) {
            answer3 = this.formDataUser.answer3;
            count++;
          }

          if (this.formDataUser.answer4) {
            answer4 = this.formDataUser.answer4;
            count++;
          }

          if (this.formDataUser.answer5) {
            answer5 = this.formDataUser.answer5;
            count++;
          }

          if (count < 3) {
            this.messageException = {
              name : '',
              status : 422,
              statusText : this.translate.instant('Specify answers'),
              message : this.translate.instant('Please enter the answers to the 3 questions you saved during registration')
            };
            this.alertClass = 'danger';
            this.SpinnerService.hide();
          } else {
            postParams['email'] = this.formData.email;
            postParams['answer1'] = answer1;
            postParams['answer2'] = answer2;
            postParams['answer3'] = answer3;
            postParams['answer4'] = answer4;
            postParams['answer5'] = answer5;
            postParams['userType'] = this.formData.userType;
            recovery = true;
          }

        } else {
          let headers = new HttpHeaders().set("Content-Type", "application/json");

          postParams['email'] = this.formData.email;

          this.http.post(environment.apiUrl + environment.apiPort + "/users/get-pbkdf-publickey", postParams, {headers})
          .subscribe(data => {
            var response: any = data;
            var code = response.pbkdfPublicKeyResponse.code;

            if (code == 202) {
              this.pbkdf = 'pbkdf';
              this.formData.userType = this.userType;
            } else if (code == 20) {
              this.messageException = {
                name : '',
                status : 10,
                statusText : this.translate.instant('Sorry'),
                message : this.translate.instant('Email not exists')
              };
              this.alertClass = 'warning';
            }

            this.SpinnerService.hide();
          }, error => {
            this.formData.userType = '';
            this.messageException = error;
            this.alertClass = 'danger';

            this.SpinnerService.hide();
          });
        }
      }
    }

    if (recovery) {
      let headers = new HttpHeaders().set("Content-Type", "application/json");

      this.http.post(environment.apiUrl + environment.apiPort + "/user/reset-password", postParams, {headers})
      .subscribe(data => {
        this.SpinnerService.hide();

        var response: any = data;

        var responseCode: number = parseInt(response.resetPasswordOutcome.code);
        var responseMessage:string = response.resetPasswordOutcome.message;

        switch (responseCode) {
          case 10:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Email not exists')
            };
            this.alertClass = 'warning';
            break;

          case 11:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Email is empty')
            };
            this.alertClass = 'warning';
            break;

          case 20:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Request already done in the last 24 hours')
            };
            this.alertClass = 'warning';
            this.submitted = true;
            break;

          case 30:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Error sending e-mail')
            };
            this.alertClass = 'warning';
            break;

          case 50:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Wrong Answer')
            };
            this.alertClass = 'warning';
            break;

          case 202:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Congratulations!'),
              message : this.translate.instant('Password recovery link sent successfully to your email address')
            };
            this.alertClass = 'success';
            this.submitted = true;
            break;

          default:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Error'),
              message : responseMessage
            };
            this.alertClass = 'danger';
            break;
        }
      }, error => {
        this.SpinnerService.hide();

        this.messageException = error;
        this.alertClass = 'danger';
      });

    }
  }
}
