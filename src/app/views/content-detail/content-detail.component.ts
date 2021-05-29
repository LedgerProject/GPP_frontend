import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GeocodeService } from '../../services/geocode.service';
import { MessageException, MessageError, Content, ContentImage } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import { Lightbox } from 'ngx-lightbox';

interface FormData {
  title: string;
  description: string;
  firstName: string;
  lastName: string;
  date: string;
  latitude: number;
  longitude: number;
  sharePosition: boolean;
  shareName: boolean;
}

@Component({
  selector: 'app-content-detail',
  templateUrl: './content-detail.component.html',
  styleUrls: ['./content-detail.component.css']
})

export class ContentDetailComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  formData: FormData;
  elementImages: Array<ContentImage>;
  element: Content;
  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  @ViewChild('modalDeleteImage') public modalDeleteImage: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: MessageError;
  errorsDescriptions: string[];
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  imagesPath: string;
  current_url: string;
  _albums:any = [];
  blob: any;

  constructor (
    private router: Router,
    private _Activatedroute:ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService,
    private SpinnerService: NgxSpinnerService,
    private _lightbox: Lightbox
  ) {
    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
    this.errorsDescriptions = [];
    this.formData = {
      title: '',
      description: '',
      firstName: '',
      lastName: '',
      date: '',
      latitude: null,
      longitude: null,
      sharePosition: false,
      shareName: false
    };
    this.elementImages = [];
    this.imagesPath = environment.imagesUrl;
    this.current_url = router.url;

    if (this.router.url.indexOf('abusealarms') > 0) {
      this.current_url = '/abusealarms';
    } else if (this.current_url.indexOf('news-stories') > 0) {
      this.current_url = '/news-stories';
    }
    this.blob = null;
  }

  // Page init
  ngOnInit(): void {
    if (this.uuid) {
      this.getElement();
      this.getElementImages();
    }
  }

  // Get structure details
  async getElement() {
    this.SpinnerService.show();
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Get structure data
    if (this.uuid) {
      let where = '"where": { \ ' +
      '"idContent": "' + this.uuid + '" ' +
      '},';
      let filter = ' \
        { \
          "fields" : { \
            "idContent": true, \
            "idUser": false, \
            "title": true, \
            "description": true, \
            "sharePosition": true, \
            "positionLatitude": true, \
            "positionLongitude": true, \
            "shareName": true, \
            "contentType": true, \
            "insertDate": true \
          }, \ '
          + where +
          '"offset": 0, \
          "skip": 0, \
          "order": ["insertDate DESC"] \
        }';

      this.http.get<Content>(environment.apiUrl + environment.apiPort + "/contents/?filter=" + filter, {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();

        this.formData.title = data[0].title;
        this.formData.firstName = '';
        this.formData.lastName = '';
        this.formData.sharePosition = data[0].sharePosition;
        this.formData.shareName = data[0].shareName;
        this.formData.date = data[0].insertDate.substr(0,10);
        this.formData.latitude = data[0].positionLatitude;
        this.formData.longitude = data[0].positionLongitude;
        this.formData.description = data[0].description;
      }, error => {
        this.SpinnerService.hide();
        this.showExceptionMessage(error);
      });
    }
  }


  // Get structure images
  async getElementImages() {
    this.SpinnerService.show();
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Array<ContentImage>>(environment.apiUrl + environment.apiPort + "/contents/" + this.uuid + "/media", {headers} )
    .subscribe(dataImage=> {
      this.elementImages = dataImage;
      let x = 0;

      this.elementImages.forEach(element => {
        this.elementImages[x].filename = encodeURIComponent(this.elementImages[x].filename);
          if (element.mimeType == 'image/jpeg' || element.mimeType == 'image/jpg' || element.mimeType == 'image/png') {
            this.elementImages[x].fileType = 'image';
          } else {
            this.elementImages[x].fileType = 'pdf';
          }
          let bytes: number = element.size / 1000000;
          bytes = parseFloat(bytes.toFixed(2));
          this.elementImages[x].size = bytes;
        // this._albums.push({ src: '' + this.imagesPath + '/galleries/structures/' + this.elementImages[x].folder + '/'+ this.elementImages[x].filename+ '' });
        x++;
      });
      this.SpinnerService.hide();
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
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

  openDocument(idContent, idContentMedia, type = null, title = null): void {
    this.getFile(idContent, idContentMedia, type, title);
  }

  async getFile(idContent, idContentMedia, type, title) {
    this.SpinnerService.show();
    console.log(environment.apiUrl + environment.apiPort + "/contents/" + idContent + "/download/" + idContentMedia);
    let headers = new HttpHeaders().set("Authorization", "Bearer "+this.token);
    this.http.post(environment.apiUrl + environment.apiPort + "/contents/" + idContent + "/download/" + idContentMedia, {}, {headers, responseType: 'arraybuffer'} )
    .subscribe(data=> {
      this.SpinnerService.hide();
      this.blob = data;
      this.downloadFile(data, type, title);
    }, error => {
      this.SpinnerService.hide();
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
