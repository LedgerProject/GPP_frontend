import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ElementsSearch, MessageException, MessageError, QuickSearch, Content } from '../../services/models';
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
  filteredElements: Array<Content>;
  allElements: Array<Content>;
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
  contentType: string;

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
      this.contentType = 'abuseAlarm';
      this.SectionTitle = 'AbuseAlarms';
    } else if (this.current_url == '/news-stories') {
      this.contentType = 'newsStory';
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
    let preString = ',';
    if (title) {
      titleQuery =  preString + '"title": { "ilike" : "%25' +title + '%25" }';
    }
    if (name) {
      //nameQuery = preString + '"phoneNumberPrefix": "' + name + '" ';
    }
    let where = '"where": { \ ' +
    '"contentType": "' + this.contentType + '" ' +
    titleQuery +
    nameQuery +
    '},';
    let filter = ' \
      { \
        "fields" : { \
          "idContent": true, \
          "idUser": false, \
          "title": true, \
          "description": true, \
          "sharePosition": true, \
          "positionLatitude": true, \
          "positionLongitude": true, \
          "shareName": true, \
          "contentType": true, \
          "insertDate": true \
        }, \ '
        + where +
        '"offset": 0, \
        "skip": 0, \
        "order": ["insertDate DESC"] \
      }';
    // HTTP Request
    this.http.get<Array<Content>>(environment.apiUrl + environment.apiPort + "/contents?filter=" + filter, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();
      this.allElements = data;
      let index = 0;
      this.allElements.forEach(element => {
        let date = element.insertDate;
        date = date.substr(0,10);
        this.allElements[index].insertDate = date;
        index++;
      });
      this.filteredElements = this.allElements;
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
        let name = element.title.toLowerCase();
        let description = element.description.toLowerCase();
        if (name.includes(search) || description.includes(search)) {
          this.filteredElements.push(element);
        }
      });
    } else {
      this.filteredElements = this.allElements;
    }
  }

  // Open content details
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
