import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, QuickSearch, Nationality } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-nationalities',
  templateUrl: './nationalities.component.html',
  styleUrls: ['./nationalities.component.css']
})

export class NationalitiesComponent implements OnInit {
  token: string;
  formSearch: QuickSearch;
  filteredNationalities: Array<Nationality>;
  allNationalities: Array<Nationality>;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('token');
    this.filteredNationalities = [];
    this.allNationalities = [];
    this.messageException = environment.messageExceptionInit;
    this.formSearch = { search: '' };
  }

  // Page init
  ngOnInit(): void {
    this.doNationalities();
  }

  // Nationalities list
  async doNationalities() {
    this.SpinnerService.show();
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
        "skip": 0, \
        "order": [ \
          "identifier" \
        ] \
      }';

    // HTTP Request
    this.http.get<Array<Nationality>>(environment.apiUrl + environment.apiPort + "/nationalities?filter=" + filter, {headers} )
    .subscribe(data => {
      this.SpinnerService.hide();
      this.allNationalities = data;
      this.filteredNationalities = data;
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Nationalities filter
  async filterNationalities() {
    let search = this.formSearch.search;

    if (search) {
      this.filteredNationalities = [];
      this.allNationalities.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.filteredNationalities.push(element);
        }
      });
    } else {
      this.filteredNationalities = this.allNationalities;
    }
  }

  // Open nationality details
  async nationalityDetails(id) {
   this.router.navigateByUrl('nationality-details/' + id);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
