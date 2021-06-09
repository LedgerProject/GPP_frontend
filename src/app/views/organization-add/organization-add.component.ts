import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageException, MessageError, Organization, TokenCredential } from '../../services/models';
import { environment } from '../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-organization-add',
  templateUrl: './organization-add.component.html',
  styleUrls: ['./organization-add.component.css']
})

export class OrganizationAddComponent implements OnInit {
  token: string;
  formData: Organization;
  messageError: MessageError;
  errorsDescriptions: string[];
  messageException: MessageException;
  permissions: any;

  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;

  constructor (
    private router: Router,
    private http: HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('token');
    this.messageError = environment.messageErrorInit;
    this.messageException = environment.messageExceptionInit;
    this.formData = {
      idOrganization: '',
      name: ''
    };
  }

  // Page init
  ngOnInit(): void {}

  // Save organization
  async saveOrganization() {
    this.errorsDescriptions = [];

    // Check if entered the name
    if (!this.formData.name) {
      this.errorsDescriptions.push(this.translate.instant('Please enter the organization name'));
    }

    // Check if there are no errors
    if (this.errorsDescriptions.length === 0) {
      this.SpinnerService.show();

      // Data save
      let postParams = {
        name: this.formData.name
      };

      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      this.http.post<Organization>(environment.apiUrl + environment.apiPort + "/organizations", postParams, {headers} )
      .subscribe(data => {
        this.SpinnerService.hide();

        if (data.idOrganization) {
          this.signInOrganization(data.idOrganization);
        }
      }, error => {
        this.SpinnerService.hide();

        let code = error.status;

        switch (code) {
          case 422:
            this.showErrorMessage(
              this.translate.instant('Conflict'),
              this.translate.instant('The organization name has already been specified.')
            );
            break;

          default:
              this.showExceptionMessage(error);
            break;
        }
      });
    } else {
      this.SpinnerService.hide();

      // Missing data
      this.showErrorMessage(
        this.translate.instant('Missing data'),
        this.translate.instant('The data entered is incorrect or missing.')
      );
    }
  }

  // Sign in with the inserted organization
  async signInOrganization(idOrganization) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

    this.http.get<TokenCredential>(environment.apiUrl + environment.apiPort + "/users/change-organization/" + idOrganization, {headers})
    .subscribe(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('idOrganization', idOrganization);

        this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };

        this.router.navigateByUrl('wallet');
      }
    });
  }

  // Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

  // Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
