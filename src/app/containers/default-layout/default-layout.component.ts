import {Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageException, UserMe, OrganizationUser } from '../../services/models';
import { environment } from '../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';

interface ChangeToken {
  token: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})

export class DefaultLayoutComponent implements OnInit {
  token: string;
  userMe: UserMe;
  defaultOrganization: string;
  organizations: Array<OrganizationUser>;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;

  public isMenuCollapsed = true;
  navbarOpen = false;

  constructor (
    private router: Router,
    private http:HttpClient,
    public translate: TranslateService,
    public userdata: UserdataService
  ) {
    this.token = localStorage.getItem('token');
    this.userMe = {
      name: '',
      permissions: [],
      idUser: '',
      userType: '',
      idOrganization: '',
      email: ''
    };
    this.defaultOrganization = '';
    this.messageException = environment.messageExceptionInit;
    this.organizations = [];
  }

  currentRouter = this.router.url;

  // Page init
  ngOnInit() {
    this.usersMe();
  }

  // Toggle navbar
  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  // Get basic auth user information
  async usersMe() {
    if (this.token) {
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      this.http.get<UserMe>(environment.apiUrl + environment.apiPort + "/users/me", {headers})
      .subscribe(data => {
        if (data.idUser) {
          this.userMe = data;

          if (this.userMe.idOrganization) {
            localStorage.setItem('idOrganization', this.userMe.idOrganization);
          } else {
            localStorage.setItem('idOrganization', '');
          }
          localStorage.setItem('idUser', this.userMe.idUser);
          localStorage.setItem('name', this.userMe.name);
          localStorage.setItem('email', this.userMe.email);
          localStorage.setItem('permissions', JSON.stringify(this.userMe.permissions));
          localStorage.setItem('userType',this.userMe.userType);

          //Get the user organizations
          if (this.userMe.userType != 'user') {
            this.getOrganizations();
          }
        } else {
          this.router.navigateByUrl('sign-in');
        }
      }, error => {
        this.showExceptionMessage(error);
      });
    } else {
      this.router.navigateByUrl('sign-in');
    }
  }

  // Get the user organizations
  async getOrganizations() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<Array<OrganizationUser>>(environment.apiUrl + environment.apiPort + "/users/my-organizations", {headers})
    .subscribe(dataOrg => {
      localStorage.setItem('organizations', JSON.stringify(dataOrg));
      if (dataOrg) {
        if (this.userMe.idOrganization) {
          dataOrg.forEach(element => {
            if (element.idOrganization == this.userMe.idOrganization) {
              this.defaultOrganization = element.name;
            }
            this.organizations.push(element);
          });
        }
      }
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Switch organization
  async switchOrganization(idOrganization) {
    let token = localStorage.getItem('token');

    let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

    this.http.get<ChangeToken>(environment.apiUrl + environment.apiPort + "/users/change-organization/" + idOrganization, {headers})
    .subscribe(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        this.router.navigate([this.currentRouter]);
      }
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Create organization
  createOrganization() {
    if (!this.organizations.length) {
      this.router.navigateByUrl('organization-add');
    }
  }

  // Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
