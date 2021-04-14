import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageException, TokenCredential } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
interface FormData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: 'signin.component.html'
})

export class SigninComponent implements OnInit {
  formData: FormData;
  messageException: MessageException;
  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.formData = {
      email: '',
      password: ''
    };
    this.messageException = environment.messageExceptionInit;
  }

  // Page init
  ngOnInit(): void {}

  // Sign in
  async signIn() {
    this.SpinnerService.show();
    let tryLogin = true;
    let email = this.formData.email;
    let password = this.formData.password;

    if (!email || !password) {
      this.messageException = {
        name : '',
        status : 422,
        statusText : this.translate.instant('Specify access data'),
        message : this.translate.instant('Enter email and password to log in.')
      };

      tryLogin = false;
      this.SpinnerService.hide();
    }

    if (password.length < 8) {
      this.messageException = {
        name : '',
        status : 422,
        statusText : this.translate.instant('Wrong password'),
        message : this.translate.instant('Enter a password of at least 8 characters.')
      };

      tryLogin = false;
      this.SpinnerService.hide();
    }

    if (tryLogin) {
      let postParams = {
        email: email,
        password: password
      }

      let headers = new HttpHeaders().set("Content-Type", "application/json");

      this.http.post<TokenCredential>(environment.apiUrl + environment.apiPort + "/users/login", postParams, {headers})
      .subscribe(data => {
        localStorage.setItem('token', data.token);
        this.SpinnerService.hide();
        this.router.navigateByUrl('wallet');
      }, error => {
        this.SpinnerService.hide();
        switch (error.status) {
          case 401:
            this.messageException = {
              name : '',
              status : 401,
              statusText : this.translate.instant('Wrong password'),
              message : this.translate.instant('The specified password is incorrect. Please try again, or select \'Forgot password?\' to reset the password.')
            };
          break;

          case 403:
            this.messageException = {
              name : '',
              status : 403,
              statusText : this.translate.instant('Forbidden'),
              message : this.translate.instant('You need to confirm registration email before Login.')
            };
          break;

          case 422:
            this.messageException = {
              name : '',
              status : 422,
              statusText : this.translate.instant('User not found'),
              message : this.translate.instant('User not found. Check your email, or if you are not registered, select \'Not a member yet?\' and register.')
            };
          break;

          default:
            this.messageException = error;
            break;
        }
      });
    }
  }
}
