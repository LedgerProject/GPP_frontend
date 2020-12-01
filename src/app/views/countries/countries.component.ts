import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, QuickSearch, Country } from '../../services/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})

export class CountriesComponent implements OnInit {
  token: string;
  formSearch: QuickSearch;
  filteredCountries: Array<Country>;
  allCountries: Array<Country>;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService
  ) {
    this.token = localStorage.getItem('token');
    this.filteredCountries = [];
    this.allCountries = [];
    this.messageException = environment.messageExceptionInit
    this.formSearch = { search: '' };
  }

  // Page init
  ngOnInit(): void {
    this.loadCountries();
  }

  // Countries list
  async loadCountries() {
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
        "skip": 0, \
        "order": [ \
          "identifier" \
        ] \
      }';

    // HTTP Request
    this.http.get<Array<Country>>(this.userdata.mainUrl + this.userdata.mainPort + "/countries?filter=" + filter, {headers})
    .subscribe(data => {
      this.allCountries = data;
      this.filteredCountries = data;
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Countries filter
  async filterCountries() {
    let search = this.formSearch.search;

    if (search) {
      this.filteredCountries = [];
      this.allCountries.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.filteredCountries.push(element);
        }
      });
    } else {
      this.filteredCountries = this.allCountries;
    }
  }

  // Open country details
  async countryDetails(id) {
    this.router.navigateByUrl('country-details/' + id);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}