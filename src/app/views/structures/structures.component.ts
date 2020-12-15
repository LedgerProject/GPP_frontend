import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, QuickSearch, Structure } from '../../services/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-structures',
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.css']
})

export class StructuresComponent implements OnInit {
  token: string;
  idOrganization: string;
  permissions: string;
  formSearch: QuickSearch;
  filteredStructures: Array<Structure>;
  allStructures: Array<Structure>;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService
  ) {
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
    this.permissions = localStorage.getItem('permissions');
    this.filteredStructures = [];
    this.allStructures = [];
    this.messageException = environment.messageExceptionInit;
    this.formSearch = { search: '' };
  }

  // Page init
  ngOnInit(): void {
    if (this.idOrganization || this.permissions.includes('GeneralStructuresManagement')) {
      this.loadStructures();
    }
  }

  // Structures list
  async loadStructures() {
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
        "skip": 0, \
        "order": ["structurename"] \
      }';
    
    // HTTP Request
    this.http.get<Array<Structure>>(environment.apiUrl + environment.apiPort + "/structures?filter=" + filter, {headers})
    .subscribe(data => {
      this.allStructures = data;
      this.filteredStructures = data;
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Structures filter
  async filterStructures() {
    let search = this.formSearch.search;

    if (search) {
      this.filteredStructures = [];
      this.allStructures.forEach(element => {
        search = search.toLowerCase();
        let name = element.structurename.toLowerCase();
        let address = element.address.toLowerCase();
        let city = element.city.toLowerCase();
        let email = element.email.toLowerCase();
        if (name.includes(search) || address.includes(search) || city.includes(search) || email.includes(search)) {
          this.filteredStructures.push(element);
        }
      });
    } else {
      this.filteredStructures = this.allStructures;
    }
  }

  // Open structure details
  async structureDetails(id) {
    this.router.navigateByUrl('structure-details/' + id);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}