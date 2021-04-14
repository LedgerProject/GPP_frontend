import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../services/slugify.pipe';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, MessageError, Icon } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-icon-detail',
  templateUrl: './icon-detail.component.html',
  styleUrls: ['./icon-detail.component.css']
})

export class IconDetailComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  uploadForm: FormGroup;
  icon: Icon;
  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: MessageError;
  errorsDescriptions: string[];
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  constructor (
    private router: Router,
    private _Activatedroute:ActivatedRoute,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
    this.errorsDescriptions = [];
    this.uploadForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.required]),
      marker: new FormControl('', [Validators.required]),
      fileImage: new FormControl('', [Validators.required]),
      fileMarker: new FormControl('', [Validators.required]),
    });
    this.icon = {
      idIcon: '',
      name: '',
      image: '',
      marker: ''
    }
  }

  // Page init
  ngOnInit(): void {
    if (this.uuid) {
      this.getIcon();
    }
  }

  // Get icon details
  async getIcon() {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Icon>(environment.apiUrl + environment.apiPort + "/icons/" + this.uuid, {headers} )
    .subscribe(data=> {
      this.SpinnerService.hide();
      this.icon = data;

      if (this.icon) {
        this.uploadForm.patchValue({
          name: this.icon.name,
        });
      }
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Save icon
  saveIcon() {
    this.SpinnerService.show();
    let name = this.uploadForm.controls.name.value;
    let image = this.uploadForm.controls.image.value;
    let marker = this.uploadForm.controls.marker.value;

    this.errorsDescriptions = [];

    //Check if entered the name
    if (!name) {
      this.errorsDescriptions.push(this.translate.instant('Please, enter the icon name'));
      this.SpinnerService.hide();
    }

    //Check if entered the image
    if (!image && !this.uuid) {
      this.errorsDescriptions.push(this.translate.instant('Please, select the image file'));
      this.SpinnerService.hide();
    }

    //Check if entered the marker
    if (!marker && !this.uuid) {
      this.errorsDescriptions.push(this.translate.instant('Please, select the marker file'));
      this.SpinnerService.hide();
    }

    //Check if there are no errors
    if (this.errorsDescriptions.length === 0) {
      //Data save
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      //Check if update or insert
      if (!this.uuid) {
        const formData = new FormData();
        formData.append('file', this.uploadForm.get('fileImage').value);
        formData.append('file', this.uploadForm.get('fileMarker').value);

        this.http.post(environment.apiUrl + environment.apiPort + "/icons/" + name, formData, {headers} )
        .subscribe(data => {
          this.SpinnerService.hide();
          this.router.navigateByUrl('/icons');
        }, error => {
          this.SpinnerService.hide();
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

        this.http.patch(environment.apiUrl + environment.apiPort + "/icons/" + this.uuid, postParams, {headers} )
        .subscribe(data=> {
          this.SpinnerService.hide();
          this.router.navigateByUrl('/icons');
        }, error => {
          this.SpinnerService.hide();
          this.showExceptionMessage(error);
        });
      }
    } else {
      this.SpinnerService.hide();
      //Missing data
      this.showErrorMessage(
        this.translate.instant('Missing data'),
        this.translate.instant('The data entered is incorrect or missing.')
      );
    }
  }

  // Select icon image (post phase)
  imageSelectPost(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.patchValue({
        fileImage: file
      });
    }
  }

  // Select marker image (post phase)
  markerSelectPost(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.patchValue({
        fileMarker: file
      });
    }
  }

  // Select icon image (patch phase)
  imageSelectPatch(event) {
    this.SpinnerService.show();
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.uploadForm.patchValue({
        fileImage: file
      });

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      const formData = new FormData();
      formData.append('file', this.uploadForm.get('fileImage').value);

      this.http.patch(environment.apiUrl + environment.apiPort + "/icons/" + this.uuid + "/image/image", formData, {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();
        this.getIcon();
        this.modalInfo.show();
      }, error => {
        this.SpinnerService.hide();
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
    } else {
      this.SpinnerService.hide();
    }
  }

  // Select icon marker (patch phase)
  onMarkerPatchSelect(event) {
    this.SpinnerService.show();
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.uploadForm.patchValue({
        fileMarker: file
      });

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      const formData = new FormData();
      formData.append('file', this.uploadForm.get('fileMarker').value);

      this.http.patch(environment.apiUrl + environment.apiPort + "/icons/" + this.uuid + "/image/marker", formData, {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();
        this.getIcon();
        this.modalInfo.show();
      }, error => {
        this.SpinnerService.hide();
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
    } else {
      this.SpinnerService.hide();
    }
  }

  // Delete icon
  deleteIcon(idIcon) {
    this.SpinnerService.show();
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.delete(environment.apiUrl + environment.apiPort + "/icons/" + idIcon, {headers} )
    .subscribe(data=> {
      this.SpinnerService.hide();
      this.router.navigateByUrl('/icons');
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
}
