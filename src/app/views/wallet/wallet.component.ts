import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';
import { QuickSearch, MessageException, MessageError, TokenCredential, Document } from '../../services/models';
import { environment } from '../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from "ngx-spinner";
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
  formSearch: QuickSearch;
  filteredDocuments: Array<Document>;
  allDocuments: Array<Document>;
  blob: any;
  selectedItemsList = [];
  checkedIDs = [];

  constructor (
    private router: Router,
    public translate: TranslateService,
    private http:HttpClient,
    public userdata: UserdataService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('token');
    this.userType = localStorage.getItem('userType');
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
    this.errorsDescriptions = [];
    this.formData = {
      token: '',
    };

    this.generated_token = '';
    this.formSearch = { search: '' };
    this.filteredDocuments = [];
    this.allDocuments = [];
    this.blob = null;
  }

  // Page init
  ngOnInit(): void {
    if (this.userType == 'user') {
      this.loadPersonalDocuments();
    }
  }

  // Check token inserted
  async checkToken() {
    this.SpinnerService.show();
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
        this.SpinnerService.hide();
        localStorage.setItem('documents', JSON.stringify(data));
        localStorage.setItem('tokenWallet', this.formData.token);
        this.router.navigateByUrl('wallet-documents');
      }, error => {
        this.SpinnerService.hide();
        //console.log(error);
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
      this.SpinnerService.hide();
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
    this.SpinnerService.show();
    //Check if there are no errors
    this.checkedIDs = [];
    this.allDocuments.forEach((value, index) => {
      if (value.isChecked) {
        this.checkedIDs.push(value.idDocument);
      }
    });
    if (this.checkedIDs.length == 0) {
      this.showErrorMessage(
        this.translate.instant('No Document Selected'),
        this.translate.instant('Please select at least one Document')
      );
      this.SpinnerService.hide();
      return false;
    }
    //
    //console.log(this.checkedIDs);
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      this.http.post(environment.apiUrl + environment.apiPort + "/users-token",{}, {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();
        let token_data: any = data;
        this.generated_token = token_data.token;
        this.modalInfo.show();
      }, error => {
        this.SpinnerService.hide();
        //console.log(error);
        this.showExceptionMessage(error);
      });
    }

    //on checkbox change
    changeSelection() {
      this.selectedItemsList = this.allDocuments.filter((value, index) => {
        return value.isChecked
      });
    }
    //User Documents
    loadPersonalDocuments() {
      this.SpinnerService.show();
      this.allDocuments = [];

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
      this.http.get<Document>(environment.apiUrl + environment.apiPort + "/documents", {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();
        localStorage.setItem('documents', JSON.stringify(data));
        let documents: any = data;
        this.allDocuments = documents;
        let x = 0;
        if (this.allDocuments) {
          this.allDocuments.forEach(element => {
            if (element.mimeType == 'image/jpeg' || element.mimeType == 'image/jpg' || element.mimeType == 'image/png') {
              this.allDocuments[x].fileType = 'image';
            } else {
              this.allDocuments[x].fileType = 'pdf';
            }
            this.allDocuments[x].isChecked = false;
            let bytes: number = element.size / 1000000;
            bytes = parseFloat(bytes.toFixed(2));
            this.allDocuments[x].size = bytes;
            x++;
          });
        }
        this.filteredDocuments = this.allDocuments;
      }, error => {
        this.SpinnerService.hide();
        //let code = error.status;
        this.showExceptionMessage(error);
      });
    }

  // Documents filter
  async filterDocuments() {
    let search = this.formSearch.search;

    if (search) {
      this.filteredDocuments = [];
      this.allDocuments.forEach(element => {
        search = search.toLowerCase();
        let title = element.title.toLowerCase();
        if (title.includes(search)) {
          this.filteredDocuments.push(element);
        }
      });
    } else {
      this.filteredDocuments = this.allDocuments;
    }
  }

  // Open document details
  async openDocument(uuid, type = null, title = null) {
    if (this.userType == 'user') {
      this.getPersonalFile(uuid, type, title);
    }
  }

  async getPersonalFile(uuid, type, title) {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer "+this.token);
    this.http.get(environment.apiUrl + environment.apiPort + "/documents/" + uuid, {headers, responseType: 'arraybuffer'} )
    .subscribe(data=> {
      this.SpinnerService.hide();
      this.blob = data;
      this.downloadFile(data, type, title);
    }, error => {
      this.SpinnerService.hide();
      //console.log(error);
      alert( this.translate.instant('Invalid Token') );
    });
  }

  downloadFile(data: any, type: string,title:string) {
    let blob = new Blob([data], { type: type});
    let url = window.URL.createObjectURL(blob);
    //let pwa = window.open(url);
    //if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
    //    alert( 'Please disable your Pop-up blocker and try again.');
    //}
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = title;
    a.click();
    window.URL.revokeObjectURL(url);
  }

}
