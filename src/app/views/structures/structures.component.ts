import { LowerCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-structures',
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.css']
})
export class StructuresComponent implements OnInit {
  formData: any;
  response:any;
  http_response:any;
  show_structures:any;
  all_structures:any;
  token: any;

  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: any;

  constructor (private router: Router, private http:HttpClient, public userdata: UserdataService, public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_structures = {};
    this.all_structures = {};
    this.token = localStorage.getItem('token');

    this.messageException = { name : '', status : '', statusText : '', message : ''};
  }

  ngOnInit(): void {
    this.doStructures();
  }

  // Structures search (onKeyUp)
  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_structures = [];
      this.all_structures.forEach(element => {
        search = search.toLowerCase();
        let name = element.structurename.toLowerCase();
        let address = element.address.toLowerCase();
        let city = element.city.toLowerCase();
        let email = element.email.toLowerCase();
        if (name.includes(search) || address.includes(search) || city.includes(search) || email.includes(search)) {
          this.show_structures.push(element);
        }
      });
    } else {
      this.show_structures = this.all_structures;
    }
  }

  // Open structure details
  async doOpen(id) {
    this.router.navigateByUrl('structure-details/' + id);
  }

  // Countries list
  async doStructures() {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Filters
    let filter = ' \
      { \
        "fields" : { \
          "idStructure": true, \
          "idOrganization": false, \
          "organizationname": false, \
          "alias": true, \
          "structurename": true, \
          "address": true, \
          "city": true, \
          "latitude": false, \
          "longitude": false, \
          "email": true, \
          "phoneNumberPrefix": true, \
          "phoneNumber": true, \
          "website": true, \
          "idIcon": false, \
          "iconimage":true, \
          "iconmarker":false \
        }, \
        "offset": 0, \
        "limit": 100, \
        "skip": 0, \
        "order": ["structurename"] \
      }';
    
    // HTTP Request
    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/structures?filter=" + filter, {headers})
    .subscribe(data=> {
      this.http_response = data;
      this.response.exit = 1000;

      let x = 0;
      this.http_response.forEach(element => {
        let icon = this.http_response[x].iconimage;
        this.http_response[x].iconimage = 'data:image/png;base64,' + icon;
        x++;
      });

      this.all_structures = this.http_response;
      this.show_structures = this.all_structures;

      this.response.error = '';
      this.response.success = 'Operation Completed!';
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
