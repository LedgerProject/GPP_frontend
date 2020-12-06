import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, QuickSearch, User } from '../../services/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css']
})

export class OperatorsComponent implements OnInit {
  token: string;
  idOrganization: string;
  permissions: string;
  formSearch: QuickSearch;
  filteredOperators: Array<User>;
  allOperators: Array<User>;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  constructor (
    private router: Router,
    private http:HttpClient
  ) {
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
    this.permissions = localStorage.getItem('permissions');
    this.filteredOperators = [];
    this.allOperators = [];
    this.messageException = environment.messageExceptionInit;
    this.formSearch = { search: '' };
  }

  // Page init
  ngOnInit(): void {
    if (this.idOrganization || this.permissions.includes('GeneralUsersManagement')) {
      this.loadOperators();
    }
  }

  // Operators list
  async loadOperators() {
    this.http.get<Array<User>>("assets/api/operators.json")
    .subscribe(data => {
      this.allOperators = data;
      this.filteredOperators = this.allOperators;
    }, error => {
      this.showExceptionMessage(error);
    });
  }  
  
  // Operators filter
  async filterOperators() {
    let search = this.formSearch.search;

    if (search) {
      this.filteredOperators = [];
      this.allOperators.forEach(element => {
        search = search.toLowerCase();
        let firstName = element.firstName.toLowerCase();
        let lastName = element.lastName.toLowerCase();
        let email = element.email.toLowerCase();
        let fullName = firstName + ' ' + lastName;

        if (firstName.includes(search) || lastName.includes(search) || email.includes(search) || fullName.includes(search)) {
          this.filteredOperators.push(element);
        }
      });
    } else {
      this.filteredOperators = this.allOperators;
    }
  }

  // Open operator details
  async operatorDetails(uuid) {
    this.router.navigateByUrl('operator-details/' + uuid);
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}