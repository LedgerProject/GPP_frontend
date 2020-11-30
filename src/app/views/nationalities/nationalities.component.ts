import { LowerCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-nationalities',
  templateUrl: './nationalities.component.html',
  styleUrls: ['./nationalities.component.css']
})
export class NationalitiesComponent implements OnInit {
  formData: any;
  response:any;
  http_response:any;
  show_nationalities:any;
  all_nationalities:any;
  token: any;
  idOrganization:any;

  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: any;

  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_nationalities = [];
    this.all_nationalities = [];
    this.token = localStorage.getItem('token');

    this.messageException = { name : '', status : '', statusText : '', message : ''};
  }

  ngOnInit(): void {
    this.doNationalities();
  }

  // Nationalities list
  async doNationalities() {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Filters
    let filter = ' \
      { \
        "fields": { \
          "idNationality": true, \
          "identifier": true \
        }, \
        "offset": 0, \
        "limit": 100, \
        "skip": 0, \
        "order": [ \
          "identifier" \
        ] \
      }';

    // HTTP Request
    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/nationalities?filter=" + filter, {headers} )
    .subscribe(data=> {
      this.http_response = data;
      this.response.exit = 1000;

      let nationalities: any = [];
      nationalities = this.http_response;
      nationalities.forEach(element => {
        let nationality: any = {};

        nationality.idNationality = element.idNationality;
        nationality.identifier = element.identifier;
        nationality.name = '';

        this.all_nationalities.push(nationality);
        this.show_nationalities.push(nationality);
      });
      this.response.error = '';
      this.response.success = 'Operation Completed!';
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Nationalities search (onKeyUp)
  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_nationalities = [];
      this.all_nationalities.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.show_nationalities.push(element);
        }
      });
    } else {
      this.show_nationalities = this.all_nationalities;
    }
  }

  // Open nationality details
  async doOpen(id) {
   this.router.navigateByUrl('nationality-details/'+id);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}

