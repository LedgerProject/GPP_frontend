import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GeocodeService } from '../../services/geocode.service';
import { MessageException, MessageError, Structure, StructureImage } from '../../services/models';
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
  elementImages: Array<StructureImage>;
  element: Structure;
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
      longitude: null
    };
    this.elementImages = [];
    this.imagesPath = environment.imagesUrl;
    this.current_url = router.url;

    if (this.router.url.indexOf('abusealarms') > 0) {
      this.current_url = '/abusealarms';
    } else if (this.current_url.indexOf('news-stories') > 0) {
      this.current_url = '/news-stories';
    }
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
      this.http.get<Structure>(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid, {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();
        this.formData.title = data.name;
        this.formData.firstName = data.address;
        this.formData.lastName = data.city;
        this.formData.date = data.email;
        this.formData.latitude = data.latitude;
        this.formData.longitude = data.longitude;
        this.formData.description = data.name;
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

    this.http.get<Array<StructureImage>>(environment.apiUrl + environment.apiPort + "/structures/" + this.uuid + "/structures-images", {headers} )
    .subscribe(dataImage=> {
      this.elementImages = dataImage;
      let x = 0;

      this.elementImages.forEach(element => {
        this.elementImages[x].filename = encodeURIComponent(this.elementImages[x].filename);
        //this.elementImages[x].fullimage = { path: '' + this.imagesPath + '/galleries/structures/' + this.elementImages[x].folder + '/'+ this.elementImages[x].filename+ ''};
        this._albums.push({ src: '' + this.imagesPath + '/galleries/structures/' + this.elementImages[x].folder + '/'+ this.elementImages[x].filename+ '' });
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

  open(index: number): void {
    // open lightbox
    this._lightbox.open(this._albums, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }

}
