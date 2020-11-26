import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})

export class CountriesComponent implements OnInit {
  formData: any;
  response:any;
  http_response:any;
  show_countries:any;
  all_countries:any;
  token: any;

  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: any;

  constructor (private router: Router, private http:HttpClient, public userdata: UserdataService, public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_countries = [];
    this.all_countries = [];
    this.token = localStorage.getItem('token');

    this.messageException = { name : '', status : '', statusText : '', message : ''};
  }

  ngOnInit(): void {
    this.doCountries();
  }

  // Countries search (onKeyUp)
  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_countries = [];
      this.all_countries.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.show_countries.push(element);
        }
      });
    } else {
      this.show_countries = this.all_countries;
    }
  }

  // Open country details
  async doOpen(id) {
    this.router.navigateByUrl('country-details/' + id);
  }

  // Countries list
  async doCountries() {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    
    // Filters
    let filter = ' \
      { \
        "fields": { \
          "idCountry": true, \
          "identifier": true, \
          "completed": true \
        }, \
        "offset": 0, \
        "limit": 100, \
        "skip": 0, \
        "order": [ \
          "identifier" \
        ] \
      }';

    // HTTP Request
    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/countries?filter=" + filter, {headers})
    .subscribe(data => {
      this.http_response = data;
      this.response.exit = 1000;
      
      let countries: any = [];
      countries = this.http_response;
      countries.forEach(element => {
        let country: any = {};
        country.idCountry = element.idCountry;
        country.identifier = element.identifier;
        country.completed = element.completed;

        this.all_countries.push(country);
        this.show_countries.push(country);
      });
      
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
