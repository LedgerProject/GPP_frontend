import { Component, OnInit, Input, ComponentFactoryResolver } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  formDataUser: any;
  messageException: MessageException;
  user_type: string;
  @Input() get_user_type: string;
  questions: any;
  pbkdf: string;
  showAnswers: boolean;
  lastLoginEmail: string;
  privateKey: string;
  publicKey: string;

  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService,
    private _Activatedroute: ActivatedRoute
  ) {
    this.formData = {
      email: '',
      password: ''
    };
    this.formDataUser = {
      email: '',
      password: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
    }
    this.messageException = environment.messageExceptionInit;
    this.user_type = '';
    this.pbkdf = '';
    this.questions = [
      {'question': this.translate.instant('Where my parents met?') },
      {'question': this.translate.instant('What is the name of your first pet?') },
      {'question': this.translate.instant('What is your home town?') },
      {'question': this.translate.instant('What is the name of your first teacher?') },
      {'question': this.translate.instant('What is the surname of your mother before wedding?') }
    ];
    this.showAnswers = false;
    this.lastLoginEmail = localStorage.getItem('lastLoginEmail');
    this.privateKey = localStorage.getItem('privateKey');
    this.publicKey = localStorage.getItem('publicKey');
    //this.get_user_type = this._Activatedroute.snapshot.paramMap.get('user_type');
  }

  // Page init
  ngOnInit(): void {
    this.get_user_type = this._Activatedroute.snapshot.queryParamMap.get("user_type")
    this._Activatedroute.queryParamMap.subscribe(queryParams => {
      this.get_user_type = queryParams.get("user_type")
    })
    if (this.get_user_type) {
      this.user_type = this.get_user_type;
    }
  }

  // Switch
  async switch(user_type) {
    if (user_type == 'user' || user_type == 'operator') {
      this.user_type = user_type;
    } else {
      this.user_type = '';
    }
    this.showAnswers = false;
    this.formData = {
      email: '',
      password: ''
    };
    this.formDataUser = {
      email: '',
      password: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
    }
  }

  // Sign in
  async signIn(email = null, password = null, privateKey = null, publicKey = null) {
    this.SpinnerService.show();
    let tryLogin = true;
    let lastLogin = false;
    if (!email) {
      email = this.formData.email;
    }
    if (!password) {
      password = this.formData.password;
    }

    if (!email || !password) {
      this.messageException = {
        name : '',
        status : 422,
        statusText : this.translate.instant('Specify access data'),
        message : this.translate.instant('Enter email and password to log in.')
      };

      tryLogin = false;
      this.SpinnerService.hide();
      return false;
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
      return false;
    }

    if (this.user_type == 'user') {
      tryLogin = false;
      // check last login
      if (this.lastLoginEmail && (this.lastLoginEmail == email) && this.privateKey && this.publicKey) {
        lastLogin = true;
      } else {
        // check if private key and public key generated
        if (privateKey && publicKey) {
          lastLogin = true;
        } else {
          lastLogin = false;
        }
      }
      if (!lastLogin) {
        this.showAnswers = true;
        this.formDataUser.email = this.formData.email;
        this.formDataUser.password = this.formData.password;
        this.formDataUser.answer1 = '';
        this.formDataUser.answer2 = '';
        this.formDataUser.answer3 = '';
        this.formDataUser.answer4 = '';
        this.formDataUser.answer5 = '';
        this.SpinnerService.hide();
        return false;
      } else {
        tryLogin = true;
      }
    }

    if (tryLogin) {

     let postParams = {
        email: email,
        password: password
      }

      let headers = new HttpHeaders().set("Content-Type", "application/json");

      this.http.post<TokenCredential>(environment.apiUrl + environment.apiPort + "/users/login", postParams, {headers})
      .subscribe(data => {
        if (this.user_type == 'user' && privateKey && publicKey) {
          localStorage.setItem('lastLoginEmail', email);
          localStorage.setItem('privateKey', privateKey);
          localStorage.setItem('publicKey', publicKey);
        }
        if (this.user_type == 'user') {
          localStorage.setItem('userType', this.user_type);
        }
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

  async signInAnswers() {
    this.SpinnerService.show();
    let tryLogin = true;
    let email = this.formDataUser.email;
    let password = this.formDataUser.password;

    if (!email || !password) {
      this.messageException = {
        name : '',
        status : 422,
        statusText : this.translate.instant('Specify access data'),
        message : this.translate.instant('Enter email and password to log in.')
      };

      tryLogin = false;
      this.SpinnerService.hide();
      return false;
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
      return false;
    }

    if (tryLogin) {

     let postParams = {
        email: email,
        password: password
      }

      postParams['answer1'] = '';
      postParams['answer2'] = '';
      postParams['answer3'] = '';
      postParams['answer4'] = '';
      postParams['answer5'] = '';

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
        this.SpinnerService.hide();
        return false;
      } else {
        postParams['email'] = email;
        //postParams['pbkdf'] = this.pbkdf;
        postParams['answer1'] = answer1;
        postParams['answer2'] = answer2;
        postParams['answer3'] = answer3;
        postParams['answer4'] = answer4;
        postParams['answer5'] = answer5;
        postParams['returnKeys'] = true;

        // verify answers and get keys
        let headers = new HttpHeaders().set("Content-Type", "application/json");

        this.http.post(environment.apiUrl + environment.apiPort + "/user/verify-answers", postParams, {headers})
        .subscribe(data => {
          this.SpinnerService.hide();
          var response: any = data;
          var response_code: number = parseInt(response.verifyAnswersOutcome.code);
          var response_message:string = response.verifyAnswersOutcome.message;
          switch (response_code) {
            case 10:
              this.messageException = {
                name : '',
                status : 10,
                statusText : this.translate.instant('Sorry'),
                message : this.translate.instant('Email not exists')
              };
            break;
            case 11:
              this.messageException = {
                name : '',
                status : 10,
                statusText : this.translate.instant('Sorry'),
                message : this.translate.instant('Email is empty')
              };
            break;
            case 50:
              this.messageException = {
                name : '',
                status : 10,
                statusText : this.translate.instant('Sorry'),
                message : this.translate.instant('Answers not correct')
              };
            break;
            case 51:
              this.messageException = {
                name : '',
                status : 10,
                statusText : this.translate.instant('Sorry'),
                message : this.translate.instant('Specify the answers')
              };
            break;
            case 202:
              /*this.messageException = {
                name : '',
                status : 10,
                statusText : this.translate.instant('Congratulations!'),
                message : this.translate.instant('Answers correct')
              };*/
              let privateKey = response.verifyAnswersOutcome.privateKey;
              let publicKey = response.verifyAnswersOutcome.publicKey;
              this.signIn(email,password,privateKey,publicKey);
            break;
            default:
              this.messageException = {
                name : '',
                status : 10,
                statusText : this.translate.instant('Error'),
                message : response_message
              };
              break;
          }
        }, error => {
          this.messageException = error;
          this.SpinnerService.hide();
        });

      }
    }
  }
}
