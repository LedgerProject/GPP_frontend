import { LowerCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css']
})
export class IconComponent implements OnInit {
  formData: any;
  response:any;
  http_response:any;
  show_icons:any;
  all_icons:any;
  token: any;

  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: any;

  constructor (private router: Router, private http:HttpClient, public userdata: UserdataService, public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_icons = {};
    this.all_icons = {};
    this.token = localStorage.getItem('token');

    this.messageException = { name : '', status : '', statusText : '', message : ''};
  }

  ngOnInit(): void {
    this.doIcons();
  }

  // Icons search (onKeyUp)
  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_icons = [];
      this.all_icons.forEach(element => {
        search = search.toLowerCase();
        let name = element.name.toLowerCase();
        if (name.includes(search)) {
          this.show_icons.push(element);
        }
      });
    } else {
      this.show_icons = this.all_icons;
    }
  }

  // Open icon details
  async doOpen(id) {
    this.router.navigateByUrl('icon-details/' + id);
  }

  // Icons list
  async doIcons() {
    // Headers
    let headers = new HttpHeaders().set("Authorization", "Bearer "+this.token);

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
        "limit": 100, \
        "skip": 0, \
        "order": ["name"] \
      }';

    // HTTP Request
    this.http.get(this.userdata.mainUrl + this.userdata.mainPort + "/icons?filter=" + filter, {headers})
    .subscribe(data=> {
      this.http_response = data;
      this.response.exit = 1000;
      let x = 0;
      
      this.http_response.forEach(element => {
        let icon = this.http_response[x].image;
        let marker = this.http_response[x].marker;
        this.http_response[x].image = 'data:image/png;base64,' + icon;
        this.http_response[x].marker = 'data:image/png;base64,' + marker;
        x++;
      });

      this.all_icons = this.http_response;
      this.show_icons = this.all_icons;
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
