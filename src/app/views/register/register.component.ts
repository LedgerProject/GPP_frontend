import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';
import { MessageException, RegisteredUser } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
interface RegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  emailConfirm: string;
  password: string;
  passwordConfirm: string;
  secretKey: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: 'register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  formData: RegisterUser;
  signOnCompleted: boolean;
  messageException: MessageException;
  constructor (
    public translate: TranslateService,
    private http:HttpClient,
    public userdata: UserdataService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      emailConfirm: '',
      password: '',
      passwordConfirm: '',
      secretKey: ''
    };
    this.signOnCompleted = false;
    this.messageException = environment.messageExceptionInit;
  }

  ngOnInit(): void {}

  // Sign On
  async signOn() {
    this.SpinnerService.show();
    this.signOnCompleted = false;

    let trySignOn = true;
    let queryString = "";
    let userType = "operator";
    let firstName = this.formData.firstName.trim();
    let lastName = this.formData.lastName.trim();
    let email = this.formData.email.trim();
    let emailConfirm = this.formData.emailConfirm.trim();
    let password = this.formData.password;
    let passwordConfirm = this.formData.passwordConfirm;
    let secretKey = this.formData.secretKey;
    if (secretKey) {
      queryString = "?secretKey=" + secretKey;
      userType = "gppOperator";
    }

    //Check if specified first name
    if (!firstName) {
      this.messageException = {
        name : '',
        status : 51,
        statusText : this.translate.instant('Name not specified'),
        message : this.translate.instant('Enter your first name.')
      };

      trySignOn = false;
      this.SpinnerService.hide();
    }

    //Check if specified last name
    if (!lastName) {
      this.messageException = {
        name : '',
        status : 61,
        statusText : this.translate.instant('Last name not specified'),
        message : this.translate.instant('Enter your last name.')
      };

      trySignOn = false;
      this.SpinnerService.hide();
    }

    //Check if specified email
    if (!email) {
      this.messageException = {
        name : '',
        status : 71,
        statusText : this.translate.instant('E-mail not specified'),
        message : this.translate.instant('Enter the authentication email.')
      };

      trySignOn = false;
      this.SpinnerService.hide();
    }

    //Check if specified password is at least 8 characters
    if (password.length < 8) {
      this.messageException = {
        name : '',
        status : 81,
        statusText : this.translate.instant('Incorrect password'),
        message : this.translate.instant('Enter a password of at least 8 characters.')
      };

      trySignOn = false;
      this.SpinnerService.hide();
    }

    //Check if the confirm email matches with the email
    if (trySignOn && email != emailConfirm) {
      this.messageException = {
        name : '',
        status : 71,
        statusText : this.translate.instant('Confirmation email incorrect'),
        message : this.translate.instant('The confirmation email does not match the specified email')
      };

      trySignOn = false;
      this.SpinnerService.hide();
    }

    //Check if the confirm password matches with the password
    if (trySignOn && password != passwordConfirm) {
      this.messageException = {
        name : '',
        status : 81,
        statusText : this.translate.instant('Password di conferma non corretta'),
        message : this.translate.instant('La password di conferma non corrisponde alla password immessa.')
      };

      trySignOn = false;
      this.SpinnerService.hide();
    }

    if (trySignOn) {
      let postParams = {
        userType: userType,
        email: email,
        password:password,
        firstName: firstName,
        lastName: lastName
      }

      let headers = new HttpHeaders().set("Content-Type", "application/json");

      this.http.post<RegisteredUser>(environment.apiUrl + environment.apiPort + "/users/signup" + queryString, postParams, {headers})
      .subscribe(data => {
        this.SpinnerService.hide();
        if (data.idUser) {
          this.signOnCompleted = true;
        } else {
          this.messageException = {
            name : '',
            status : 91,
            statusText : this.translate.instant('Registration failed'),
            message : this.translate.instant('There was a problem, please try again in a few seconds.')
          };
        }
      }, error => {
        this.SpinnerService.hide();
        let code = error.status;

        if (code == 422) {
          this.messageException = {
            name : '',
            status : 81,
            statusText : this.translate.instant('Incorrect password'),
            message : this.translate.instant('Enter a password of at least 8 characters.')
          };
        } else if (code == 400) {
          this.messageException = {
            name : '',
            status : 101,
            statusText : this.translate.instant('Already registered email'),
            message : this.translate.instant('The specified email is already registered in our systems. If you have forgotten your password, select the \'Forgot password?\' link')
          };
        } else if (code == 403) {
          this.messageException = {
            name : '',
            status : 101,
            statusText : this.translate.instant('Secret key is wrong'),
            message : this.translate.instant('The secret key is wrong')
          };
        } else {
          this.messageException = error;
        }
      });
    }
  }
}
