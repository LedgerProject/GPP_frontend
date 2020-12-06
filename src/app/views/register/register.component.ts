import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';
import { MessageException, RegisteredUser } from '../../services/models';
import { environment } from '../../../environments/environment';

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
    public userdata: UserdataService
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
        statusText : this.translate.instant('Nome non specificato'),
        message : this.translate.instant('Specificare il proprio nome.')
      };

      trySignOn = false;
    }

    //Check if specified last name
    if (!lastName) {
      this.messageException = {
        name : '',
        status : 61,
        statusText : this.translate.instant('Cognome non specificato'),
        message : this.translate.instant('Specificare il proprio cognome.')
      };

      trySignOn = false;
    }

    //Check if specified email
    if (!email) {
      this.messageException = {
        name : '',
        status : 71,
        statusText : this.translate.instant('E-Mail non specificata'),
        message : this.translate.instant('Specificare l\'e-mail di autenticazione.')
      };

      trySignOn = false;
    }

    //Check if specified password is at least 8 characters
    if (password.length < 8) {
      this.messageException = {
        name : '',
        status : 81,
        statusText : this.translate.instant('Password non corretta'),
        message : this.translate.instant('Specificare una password di almeno 8 caratteri.')
      };

      trySignOn = false;
    }

    //Check if the confirm email matches with the email
    if (trySignOn && email != emailConfirm) {
      this.messageException = {
        name : '',
        status : 71,
        statusText : this.translate.instant('E-Mail di conferma non corretta'),
        message : this.translate.instant('L\'e-mail di conferma non corrisponde all\'e-mail immessa.')
      };

      trySignOn = false;
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

      this.http.post<RegisteredUser>(this.userdata.mainUrl + this.userdata.mainPort + "/users/signup" + queryString, postParams, {headers}) 
      .subscribe(data => {
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
        let code = error.status;

        if (code == 422) {
          this.messageException = {
            name : '',
            status : 81,
            statusText : this.translate.instant('Password non corretta'),
            message : this.translate.instant('Specificare una password di almeno 8 caratteri.')
          };
        } else if (code == 400) {
          this.messageException = {
            name : '',
            status : 101,
            statusText : this.translate.instant('E-Mail già registrata'),
            message : this.translate.instant('L\'e-mail specificata è già registrata nei nostri sistemi. Se hai dimenticato la password, seleziona il link \'Forgot password?\'')
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