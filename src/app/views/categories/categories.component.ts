import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  formData: any;
  response:any;
  http_response:any;
  show_categories:any;
  all_categories:any;
  token: any;

  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: any;

  constructor (private router: Router, private http:HttpClient, public userdata: UserdataService, public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_categories = [];
    this.all_categories = [];
    this.token = localStorage.getItem('token');

    this.messageException = { name : '', status : '', statusText : '', message : ''};
  }

  ngOnInit(): void {
    this.doCategories();
  }

  // Categories search (onKeyUp)
  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_categories = [];
      this.all_categories.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.show_categories.push(element);
        }
      });
    } else {
      this.show_categories = this.all_categories;
    }
  }

  // Open category details
  async doOpen(id) {
    this.router.navigateByUrl('category-details/' + id);
  }

  // Categories list
  async doCategories() {
      // Headers
      let headers = new HttpHeaders().set("Authorization", "Bearer "+this.token);

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
          "limit": 100, \
          "skip": 0, \
          "order": ["identifier"] \
        }';

      // HTTP Request
      this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/categories?filter=" + filter, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        this.response.exit = 1000;

        let categories: any = [];
        categories = this.http_response;
        categories.forEach(element => {
          let category: any = {};
          category.idCategory = element.idCategory;
          category.identifier = element.identifier;

          this.all_categories.push(category);
          this.show_categories.push(category);
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

