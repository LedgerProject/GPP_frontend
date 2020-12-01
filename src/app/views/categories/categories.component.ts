import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, QuickSearch, Category } from '../../services/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})

export class CategoriesComponent implements OnInit {
  token: string;
  formSearch: QuickSearch;
  filteredCategories: Array<Category>;
  allCategories: Array<Category>;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService
  ) {
    this.token = localStorage.getItem('token');
    this.filteredCategories = [];
    this.allCategories = [];
    this.messageException = environment.messageExceptionInit;
    this.formSearch = { search: '' };
  }

  // Page init
  ngOnInit(): void {
    this.loadCategories();
  }

  // Categories list
  async loadCategories() {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    // Filters
    let filter = ' \
      { \
        "where": { \
          "type": "structures" \
        }, \
        "fields": { \
          "idCategory": true, \
          "identifier": true, \
          "type": true \
        }, \
        "offset": 0, \
        "skip": 0, \
        "order": ["identifier"] \
      }';

    // HTTP Request
    this.http.get<Array<Category>>(this.userdata.mainUrl + this.userdata.mainPort + "/categories?filter=" + filter, {headers} )
    .subscribe(data => {
      this.allCategories = data;
      this.filteredCategories = data;
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Categories filter
  async filterCategories() {
    let search = this.formSearch.search;

    if (search) {
      this.filteredCategories = [];
      this.allCategories.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.filteredCategories.push(element);
        }
      });
    } else {
      this.filteredCategories = this.allCategories;
    }
  }

  // Open category details
  async categoryDetails(id) {
    this.router.navigateByUrl('category-details/' + id);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = {
      name : error.name,
      status : error.status,
      statusText : error.statusText,
      message : error.message
    };

    this.modalException.show();
  }
}