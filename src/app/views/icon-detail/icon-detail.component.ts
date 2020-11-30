import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-icon-detail',
  templateUrl: './icon-detail.component.html',
  styleUrls: ['./icon-detail.component.css']
})
export class IconDetailComponent implements OnInit {
  @Input() uuid: string;
  response:any;
  formData: any;
  http_response:any;
  current_language:any;
  languages:any;
  token: any;
  name_langs: any;
  icon: any;

  @ViewChild('modalInfo') public modalInfo: ModalDirective;

  @ViewChild('modalDelete') public modalDelete: ModalDirective;

  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: any;
  errorsDescriptions: any;

  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: any;

  image: any;
  marker: any;
  uploadForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    marker: new FormControl('', [Validators.required]),
    image_patch: new FormControl('', [Validators.required]),
    marker_patch: new FormControl('', [Validators.required]),
    fileImage: new FormControl('', [Validators.required]),
    fileMarker: new FormControl('', [Validators.required]),
  });

  constructor (
    private router: Router,
    private _Activatedroute:ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService,
    private slugifyPipe: SlugifyPipe,
    public _d: DomSanitizer,
    ) {
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.icon = { name: '', image: '', marker: '' };
    this.image = '';
    this.marker = '';

    this.messageError = { title : '', description : '' };
    this.errorsDescriptions = [];

    this.messageException = { name : '', status : '', statusText : '', message : '' };
  }

  ngOnInit(): void {
    if (this.uuid) {
      this.getIcons(this.token);
    }
  }

  async getIcons(token) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/icons/" + this.uuid, {headers} )
    .subscribe(data=> {
      this.icon = data;

      if (this.icon) {
        this.uploadForm.patchValue({
          name: this.icon.name,
        });
        this.image = 'data:image/png;base64,' + this.icon.image;
        this.marker = 'data:image/png;base64,' + this.icon.marker;
      }
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  onSubmit() {
    let name = this.uploadForm.controls.name.value;
    let image = this.uploadForm.controls.image.value;
    let marker = this.uploadForm.controls.marker.value;

    this.errorsDescriptions = [];

    //Check if entered the name
    if (!name) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the icon name'));
    }

    //Check if entered the image
    if (!image && !this.uuid) {
      this.errorsDescriptions.push(this.translate.instant('Please, select the image file'));
    }

    //Check if entered the marker
    if (!marker && !this.uuid) {
      this.errorsDescriptions.push(this.translate.instant('Please, select the marker file'));
    }

    if (this.errorsDescriptions.length === 0) {
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      if (!this.uuid) {
        const formData = new FormData();
        formData.append('file', this.uploadForm.get('fileImage').value);
        formData.append('file', this.uploadForm.get('fileMarker').value);

        this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/icons/"+name, formData,{headers} )
        .subscribe(data => {
          this.router.navigateByUrl('/icons');
        },error => {
          let code = error.status;

          switch (code) {
            case 400:
              this.showErrorMessage(this.translate.instant('Error uploading icon'), this.translate.instant('Please check that image file is 48x48 pixels, and marker file is 32x37 pixels.'));
            break;

            default:
              this.showExceptionMessage(error);
            break;
          }
        });
      } else {
        let postParams = {
          name: name
        };

        this.http.patch(this.userdata.mainUrl + this.userdata.mainPort + "/icons/" + this.uuid, postParams, {headers} )
        .subscribe(data=> {
          this.http_response = data;
          this.router.navigateByUrl('/icons');
        }, error => {
          this.showExceptionMessage(error);
        });
      }
    } else {
      this.showErrorMessage(
        this.translate.instant('Missing data'),
        this.translate.instant('The data entered is incorrect or missing.')
      );
    }
  }

  onImageSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.patchValue({
        fileImage: file
      });
    }
  }

  onMarkerSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.patchValue({
        fileMarker: file
      });
    }
  }

  onImagePatchSelect(event) {
    const file = event.srcElement.files[0];

    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.uploadForm.patchValue({
        fileImage: file
      });

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      const formData = new FormData();
      formData.append('file', this.uploadForm.get('fileImage').value);

      this.http.patch(this.userdata.mainUrl + this.userdata.mainPort + "/icons/" + this.uuid + "/image/image", formData, {headers} )
      .subscribe(data => {
        this.image = this._d.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
        this.modalInfo.show();
      },error => {
        let code = error.status;

        switch (code) {
          case 400:
            this.showErrorMessage(this.translate.instant('Error uploading icon'), this.translate.instant('Please check that image file is 48x48 pixels.'));
          break;

          default:
            this.showExceptionMessage(error);
          break;
        }
      });
    }
  }

  onMarkerPatchSelect(event) {
    const file = event.srcElement.files[0];

    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.uploadForm.patchValue({
        fileMarker: file
      });

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      const formData = new FormData();
      formData.append('file', this.uploadForm.get('fileMarker').value);

      this.http.patch(this.userdata.mainUrl + this.userdata.mainPort + "/icons/" + this.uuid + "/image/marker", formData, {headers} )
      .subscribe(data => {
        this.marker = this._d.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
        this.modalInfo.show();
      },error => {
        let code = error.status;

        switch (code) {
          case 400:
            this.showErrorMessage(this.translate.instant('Error uploading icon'), this.translate.instant('Please check that marker file is 32x37 pixels.'));
          break;

          default:
            this.showExceptionMessage(error);
          break;
        }
      });
    }
  }

  doDelete(idIcon) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(this.userdata.mainUrl + this.userdata.mainPort + "/icons/" + idIcon, {headers} )
    .subscribe(data=> {
      this.http_response = data;
      this.router.navigateByUrl('/icons');
    }, error => {
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
}
