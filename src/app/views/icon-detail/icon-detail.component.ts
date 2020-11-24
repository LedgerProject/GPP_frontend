import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { SlugifyPipe } from '../../pipes/slugify.pipe';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

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
    this.icon = { name: '', image: '', marker: ''};
    this.image = '';
    this.marker = '';
  }

  ngOnInit(): void {
    if (this.uuid) {
      this.getIcon(this.token);
    }
  }


  get f(){
    return this.uploadForm.controls;
  }

  onImageSelect(event) {

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.patchValue({
        fileImage: file
      });
    }
  }

  onImageSelectPatch(event) {

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.patchValue({
        image: file
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

  onMarkerSelectPatch(event) {

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.patchValue({
        marker: file
      });
    }
  }

  onSubmit() {
    let name = this.uploadForm.controls.name.value;
    let image = this.uploadForm.controls.image.value;
    let marker = this.uploadForm.controls.marker.value;

    let headers = new HttpHeaders()
    .set("Authorization", "Bearer "+this.token)
    ;

    if (!this.uuid) {

     if (!name) {
      alert( this.translate.instant('Please, enter the name') );
     } else if (!image) {
      alert( this.translate.instant('Please, select the image File') );
     } else if (!marker) {
      alert( this.translate.instant('Please, select the marker File') );
     } else {

     const formData = new FormData();
     formData.append('file', this.uploadForm.get('fileImage').value);
     formData.append('file', this.uploadForm.get('fileMarker').value);

     this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/icons/"+name, formData,{headers} )
     .subscribe(data => {
      console.log(data);
      this.router.navigateByUrl('/icons');
     },error => {
      let code = error.status;
      console.log(error);
      if (code == 400) {
        alert( this.translate.instant('Please, check Image File 48x48 pixels, and Marker File 32x37 pixels') );
      } else if (code == 409) {
        alert( this.translate.instant('The entered name already exists. Please enter a different name') );
      }
     });

     }
   } else {
    if (!name) {
      alert( this.translate.instant('Please, enter the name') );
    } else {

      let postParams = {
        idIcon: this.uuid,
        name: name
      };
      /*if (image) {
        let image_obj = { image: image}
        postParams.image = image_obj;
      }
      if (marker) {
        let marker_obj = { marker: marker}
        postParams.marker= marker_obj;
      }*/
      /*this.uploadForm.patchValue({
        name: name
      });
      const formData = new FormData();
      formData.append('name', this.uploadForm.get('name').value);*/
      /*if (image) {
        formData.append('file', this.uploadForm.get('image').value);
      }
      if (marker) {
        formData.append('file', this.uploadForm.get('marker').value);
      }*/
      //console.log(postParams);
      this.http.patch(this.userdata.mainUrl+this.userdata.mainPort+"/icons/"+this.uuid,postParams, {headers} )
      .subscribe(data=> {
        console.log(data);
        this.http_response = data;
        this.router.navigateByUrl('/icons');
      }, error => {
        let code = error.status;
        if (code == 400) {
          alert( this.translate.instant('Please, check Image File 48x48 pixels, and Marker File 32x37 pixels') );
        } else if (code == 409) {
          alert( this.translate.instant('The entered name already exists. Please enter a different name') );
        } else {

        }
      });

    }
   }
  }


  async getIcon(token) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/icons/"+this.uuid, {headers} )
    .subscribe(data=> {
      this.icon = data;
      //console.log(data);

      if (this.icon) {
        this.uploadForm.patchValue({
          name: this.icon.name,
        });
        this.image = 'data:image/png;base64,'+this.icon.image;
        this.marker = 'data:image/png;base64,'+this.icon.marker;
      }

    }, error => {
      let code = error.status;
      console.log(error);
    });
  }

  doDelete(idIcon) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
    ;
    this.http.delete(this.userdata.mainUrl+this.userdata.mainPort+"/icons/"+idIcon, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        this.router.navigateByUrl('/icons');
      }, error => {
        console.log(error);
      });
  }

}
