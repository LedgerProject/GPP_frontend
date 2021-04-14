import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, QuickSearch, Icon } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css']
})

export class IconComponent implements OnInit {
  token: string;
  formSearch: QuickSearch;
  filteredIcons: Array<Icon>;
  allIcons: Array<Icon>;
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
    this.filteredIcons = [];
    this.allIcons = [];
    this.messageException = environment.messageExceptionInit
    this.formSearch = { search: '' };
  }

  // Page init
  ngOnInit(): void {
    this.loadIcons();
  }

  // Icons list
  async loadIcons() {
    this.SpinnerService.show();
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Filters
    let filter = ' \
      { \
        "fields" : { \
          "idIcon": true, \
          "name": true, \
          "image": true, \
          "marker": true \
        }, \
        "offset": 0, \
        "skip": 0, \
        "order": ["name"] \
      }';

    // HTTP Request
    this.http.get<Array<Icon>>(environment.apiUrl + environment.apiPort + "/icons?filter=" + filter, {headers})
    .subscribe(data=> {
      this.SpinnerService.hide();
      this.allIcons = data;
      this.filteredIcons = data;
    }, error => {
      this.SpinnerService.hide();
      this.showExceptionMessage(error);
    });
  }

  // Icons filter
  async filterIcons() {
    let search = this.formSearch.search;

    if (search) {
      this.filteredIcons = [];
      this.allIcons.forEach(element => {
        search = search.toLowerCase();
        let name = element.name.toLowerCase();
        if (name.includes(search)) {
          this.filteredIcons.push(element);
        }
      });
    } else {
      this.filteredIcons = this.allIcons;
    }
  }

  // Open icon details
  async iconDetails(id) {
    this.router.navigateByUrl('icon-details/' + id);
  }



  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
