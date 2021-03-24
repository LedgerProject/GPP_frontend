import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';
import { MessageException, MessageError, TokenCredential, Document } from '../../services/models';
import { environment } from '../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})

export class WalletComponent implements OnInit {
  token: string;
  formData: TokenCredential;
  userType: string;
  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: MessageError;
  errorsDescriptions: string[];
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  generated_token: string;

  constructor (
    private router: Router,
    public translate: TranslateService,
    private http:HttpClient,
    public userdata: UserdataService
  ) {
    this.token = localStorage.getItem('token');
    this.userType = localStorage.getItem('userType');
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
    this.errorsDescriptions = [];
    this.formData = {
      token: ''
    };
    this.generated_token = '';
  }

  // Page init
  ngOnInit(): void {}

  // Check token inserted
  async checkToken() {
    this.errorsDescriptions = [];

    //Check if entered the token
    if (!this.formData.token) {
      this.errorsDescriptions.push(this.translate.instant('Specificare il token'));
    }

    //Check if entered the address
    if (this.formData.token && this.formData.token.length < 6) {
      this.errorsDescriptions.push(this.translate.instant('Specificare un token di almeno 8 caratteri'));
    }

    //Check if there are no errors
    if (this.errorsDescriptions.length === 0) {
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      this.http.get<Document>(environment.apiUrl + environment.apiPort + "/documents/operator/" + this.formData.token, {headers} )
      .subscribe(data => {
        localStorage.setItem('documents', JSON.stringify(data));
        localStorage.setItem('tokenWallet', this.formData.token);
        this.router.navigateByUrl('wallet-documents');
      }, error => {
        console.log(error);
        let code = error.status;

        switch (code) {
          case 404:
            this.showErrorMessage(
              this.translate.instant('Invalid token'),
              this.translate.instant('The token entered is not valid or expired.')
            );
            break;

          default:
            this.showExceptionMessage(error);
            break;
        }
      });
    } else {
      //Missing data
      this.showErrorMessage(
        this.translate.instant('Missing data'),
        this.translate.instant('The data entered is incorrect or missing.')
      );
    }
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

  generateToken() {
    //Check if there are no errors
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      this.http.post(environment.apiUrl + environment.apiPort + "/users-token",{}, {headers} )
      .subscribe(data => {
        let token_data: any = data;
        this.generated_token = token_data.token;
        this.modalInfo.show();
      }, error => {
        console.log(error);
        this.showExceptionMessage(error);
      });
    }
}
