import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';
import { QuickSearch, MessageException, MessageError, Document } from '../../services/models';
import { environment } from '../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from "ngx-spinner";

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
  messageError: MessageError;
  errorsDescriptions: string[];
  messageException: MessageException;
  blob: any;

  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;

  constructor (
    private router: Router,
    public translate: TranslateService,
    private http:HttpClient,
    public userdata: UserdataService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.formSearch = { search: '' };
    this.filteredDocuments = [];
    this.allDocuments = [];
    this.token = localStorage.getItem('token');
    this.userType = localStorage.getItem('userType');
    this.blob = null;
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

          let bytes: number = element.size / 1000000;
          bytes = parseFloat(bytes.toFixed(2));
          this.allDocuments[x].size = bytes;
          x++;
        });
      }
      this.filteredDocuments = this.allDocuments;
    }, error => {
      this.SpinnerService.hide();

      this.showExceptionMessage(error);
    });
  }

  // Documents list
  loadDocuments() {
    this.SpinnerService.show();

    this.allDocuments = JSON.parse(localStorage.getItem('documents'));

    if (!this.allDocuments) {
      this.allDocuments = [];
    }

    let x = 0;
    if (this.allDocuments) {
      this.allDocuments.forEach(element => {
        if (element.mimeType == 'image/jpeg' || element.mimeType == 'image/jpg' || element.mimeType == 'image/png') {
          this.allDocuments[x].fileType = 'image';
        } else {
          this.allDocuments[x].fileType = 'pdf';
        }

        let bytes: number = element.size / 1000000;
        bytes = parseFloat(bytes.toFixed(2));
        this.allDocuments[x].size = bytes;
        x++;
      });
    }

    this.SpinnerService.hide();

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
  async openDocument(uuid, type = null, title = null) {
    if (this.userType == 'user') {
      this.getPersonalFile(uuid, type, title);
    } else {
      this.router.navigateByUrl('wallet-document-details/' + uuid);
    }
  }

  // Get personal file
  async getPersonalFile(uuid, type, title) {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get(environment.apiUrl + environment.apiPort + "/documents/" + uuid, {headers, responseType: 'arraybuffer'} )
    .subscribe(data=> {
      this.SpinnerService.hide();
      this.blob = data;
      this.downloadFile(data, type, title);
    }, error => {
      this.SpinnerService.hide();

      alert(this.translate.instant('Invalid Token'));
    });
  }

  // Download file
  downloadFile(data: any, type: string,title:string) {
    let blob = new Blob([data], { type: type});
    let url = window.URL.createObjectURL(blob);

    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = title;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
