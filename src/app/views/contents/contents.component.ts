import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ElementsSearch, MessageException, MessageError, QuickSearch, Structure } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-contents',
  templateUrl: './contents.component.html',
  styleUrls: ['./contents.component.css']
})

export class ContentsComponent implements OnInit {
  token: string;
  idOrganization: string;
  permissions: string;
  formFilter: QuickSearch;
  formSearch: ElementsSearch;
  filteredElements: Array<Structure>;
  allElements: Array<Structure>;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  userType: string;
  selectedItemsList = [];
  checkedIDs = [];
  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: MessageError;
  errorsDescriptions: string[];
  current_url: string;
  SectionTitle: string;

  action_delete: boolean;
  current_delete: number;
  total_delete: number;

  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
    this.permissions = localStorage.getItem('permissions');
    this.userType = localStorage.getItem('userType');
    this.filteredElements = [];
    this.allElements = [];
    this.messageException = environment.messageExceptionInit;
    this.formFilter = { search: '' };
    this.formSearch = { title: '', name: '' };
    this.messageError = environment.messageErrorInit;
    this.action_delete = false;
    this.current_url = router.url;
    if (this.current_url == '/abusealarms') {
      this.SectionTitle = 'AbuseAlarms';
    } else if (this.current_url == '/news-stories') {
      this.SectionTitle = 'News & Stories';
    }
  }

  // Page init
  ngOnInit(): void {

  }

  // Structures list
  async loadElements(title = null, name = null) {
    this.SpinnerService.show();
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Filters
    let titleQuery = '';
    let nameQuery = '';
    let preString = '';
    if (title) {
      titleQuery = '"city": { "ilike" : "%25' + title + '%25" }';
      preString = ',';
    }
    if (name) {
      nameQuery = nameQuery + preString + '"phoneNumberPrefix": "' + name + '" '
    }
    let where = '"where": { \ ' +
    titleQuery +
    nameQuery +
    '},';
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
        }, \ '
        + where +
        '"offset": 0, \
        "skip": 0, \
        "order": ["structurename"] \
      }';
    // console.log(filter);
    // HTTP Request
    this.http.get<Array<Structure>>(environment.apiUrl + environment.apiPort + "/structures?filter=" + filter, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();
      this.allElements = data;
      this.filteredElements = data;
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Structures filter
  async filterElements() {
    let search = this.formFilter.search;

    if (search) {
      this.filteredElements = [];
      this.allElements.forEach(element => {
        search = search.toLowerCase();
        let name = element.structurename.toLowerCase();
        let address = element.address.toLowerCase();
        let city = element.city.toLowerCase();
        let email = element.email.toLowerCase();
        if (name.includes(search) || address.includes(search) || city.includes(search) || email.includes(search)) {
          this.filteredElements.push(element);
        }
      });
    } else {
      this.filteredElements = this.allElements;
    }
  }

  // Open structure details
  async elementDetails(id) {
    this.router.navigateByUrl(this.current_url + '-details/' + id);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }

  onSubmit(form) {
    const title = form.value.title;
    const name = form.value.name;
    this.loadElements(title,name);
  }

  //Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

}
