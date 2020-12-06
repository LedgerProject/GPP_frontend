import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageException, TokenCredential } from '../../services/models';
import { environment } from '../../../environments/environment';

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
    public translate: TranslateService
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
    let tryLogin = true;
    let email = this.formData.email;
    let password = this.formData.password;

    if (!email || !password) {
      this.messageException = {
        name : '',
        status : 422,
        statusText : this.translate.instant('Specifica i dati di accesso'),
        message : this.translate.instant('Specifica l\'e-mail e la password per accedere.')
      };

      tryLogin = false;
    }

    if (password.length < 8) {
      this.messageException = {
        name : '',
        status : 422,
        statusText : this.translate.instant('Password errata'),
        message : this.translate.instant('Specifica una password di almeno 8 caratteri.')
      };

      tryLogin = false;
    }

    if (tryLogin) {
      let postParams = {
        email: email,
        password: password
      }
  
      let headers = new HttpHeaders().set("Content-Type", "application/json");

      this.http.post<TokenCredential>(this.userdata.mainUrl + this.userdata.mainPort + "/users/login", postParams, {headers})
      .subscribe(data => {
        localStorage.setItem('token', data.token);
        this.router.navigateByUrl('wallet');
      }, error => {
        switch (error.status) {
          case 401:
            this.messageException = {
              name : '',
              status : 401,
              statusText : this.translate.instant('Password errata'),
              message : this.translate.instant('La password specificata non è corretta. Riprova, oppure seleziona \'Forgot password?\' per ripristinare la password.')
            };
          break;

          case 422:
            this.messageException = {
              name : '',
              status : 422,
              statusText : this.translate.instant('Utente non trovato'),
              message : this.translate.instant('Utente non trovato. Controlla la tua e-mail, oppure se non sei registrato, seleziona \'Not a member yet?\' ed effettua la registrazione.')
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
