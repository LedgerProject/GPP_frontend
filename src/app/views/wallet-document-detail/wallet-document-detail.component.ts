import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';

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
  http_response:any;
  blob: any;
  file_type: any;

  constructor(
    private _Activatedroute:ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    private http: HttpClient,
    public userdata: UserdataService
  ) {
    this.document = {'uuid':'','title':'','url':'','size':'','icon':''};
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
          //console.log(this.document);
        }
      });
    }
    this.token = localStorage.getItem('token');
    this.wallet = localStorage.getItem('wallet');
    this.http_response = null;
    this.blob = null;
  }

  ngOnInit(): void {
    this.getFile();
  }

  async getFile() {

      let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
      ;

      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/documents/"+this.document.idDocument+"/operator/"+this.wallet, {headers, responseType: 'arraybuffer'} )
      .subscribe(data=> {
        //console.log(data);
        this.blob = data;
      }, error => {
        console.log(error);
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
