import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';
import { QuickSearch, MessageException, MessageError, TokenCredential, Document } from '../../services/models';
import { environment } from '../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-wallet-documents',
  templateUrl: './wallet-documents.component.html',
  styleUrls: ['./wallet-documents.component.css']
})

export class WalletDocumentsComponent implements OnInit {
  token: string;
  formSearch: QuickSearch;
  filteredDocuments: Array<Document>;
  allDocuments: Array<Document>;
  userType: string;
  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: MessageError;
  errorsDescriptions: string[];
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  constructor (
    private router: Router,
    public translate: TranslateService,
    private http:HttpClient,
    public userdata: UserdataService
  ) {
    this.formSearch = { search: '' };
    this.filteredDocuments = [];
    this.allDocuments = [];
    this.token = localStorage.getItem('token');
    this.userType = localStorage.getItem('userType');

  }

  // Page init
  ngOnInit(): void {
    if (this.userType == 'user') {
      this.loadPersonalDocuments();
    } else {
      this.loadDocuments();
    }
  }

  // Documents list
  loadPersonalDocuments() {
    this.allDocuments = [];

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    this.http.get<Document>(environment.apiUrl + environment.apiPort + "/documents", {headers} )
    .subscribe(data => {
      localStorage.setItem('documents', JSON.stringify(data));
      let documents: any = data;
      this.allDocuments = documents;
      let x = 0;
      if (this.allDocuments) {
        this.allDocuments.forEach(element => {
          if (element.mimeType == 'image/jpeg' || element.mimeType == 'image/jpg' || element.mimeType == 'image/png') {
            this.allDocuments[x].mimeType = 'image';
          } else {
            this.allDocuments[x].mimeType = 'pdf';
          }
          let bytes: number = element.size / 1000000;
          bytes = parseFloat(bytes.toFixed(2));
          this.allDocuments[x].size = bytes;
          x++;
        });
      }
      this.filteredDocuments = this.allDocuments;
    }, error => {
      //let code = error.status;
      this.showExceptionMessage(error);
    });
  }


  // Documents list
  loadDocuments() {
    this.allDocuments = JSON.parse(localStorage.getItem('documents'));
    if (!this.allDocuments) {
      this.allDocuments = [];
    }
    let x = 0;
    if (this.allDocuments) {
    this.allDocuments.forEach(element => {
      if (element.mimeType == 'image/jpeg' || element.mimeType == 'image/jpg' || element.mimeType == 'image/png') {
        this.allDocuments[x].mimeType = 'image';
      } else {
        this.allDocuments[x].mimeType = 'pdf';
      }
      let bytes: number = element.size / 1000000;
      bytes = parseFloat(bytes.toFixed(2));
      this.allDocuments[x].size = bytes;
      x++;
    });
    }

    this.filteredDocuments = this.allDocuments;
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
  async openDocument(uuid) {
    this.router.navigateByUrl('wallet-document-details/' + uuid);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
