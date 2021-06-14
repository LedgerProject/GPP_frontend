import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-wallet-document-detail',
  templateUrl: './wallet-document-detail.component.html',
  styleUrls: ['./wallet-document-detail.component.css']
})

export class WalletDocumentDetailComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  document: any;
  wallet: any;
  blob: any;
  file_type: any;
  userType: string;

  constructor(
    private _Activatedroute:ActivatedRoute,
    public translate: TranslateService,
    private http: HttpClient,
    public userdata: UserdataService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.document = {'uuid':'','title':'','url':'','size':'','icon':'', 'mimeType':''};
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    let documents = JSON.parse(localStorage.getItem('documents'));

    if (documents) {
      documents.forEach(element => {
        if (element.idDocument == this.uuid) {
          this.file_type = element.mimeType;

          if (element.mimeType == 'image/jpeg' || element.mimeType == 'image/jpg' || element.mimeType == 'image/png') {
            element.mimeType = 'image';
          } else {
            element.mimeType = 'pdf';
          }

          let bytes:any = element.size / 1000000;
          bytes = bytes.toFixed(2);
          element.size = bytes;
          this.document = element;
        }
      });
    }

    this.token = localStorage.getItem('token');
    this.wallet = localStorage.getItem('tokenWallet');
    this.userType = localStorage.getItem('userType');
    this.blob = null;
  }

  // Page init
  ngOnInit(): void {
    if (this.userType == 'user') {
      this.getPersonalFile();
    } else {
      this.getFile();
    }
  }

  // Get personal file
  async getPersonalFile() {
    this.SpinnerService.show();

    let headers = new HttpHeaders().set("Authorization", "Bearer "+this.token);

    this.http.get(environment.apiUrl + environment.apiPort + "/documents/" + this.uuid, {headers, responseType: 'arraybuffer'} )
    .subscribe(data=> {
      this.SpinnerService.hide();
      this.blob = data;
    }, error => {
      this.SpinnerService.hide();
      alert(this.translate.instant('Invalid Token'));
    });
  }

  // Get file
  async getFile() {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer "+this.token);

    this.http.get(environment.apiUrl + environment.apiPort + "/documents/" + this.document.idDocument + "/operator/" + this.wallet, {headers, responseType: 'arraybuffer'} )
    .subscribe(data=> {
      this.SpinnerService.hide();

      this.blob = data;
    }, error => {
      this.SpinnerService.hide();
      console.log(error);
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
}
