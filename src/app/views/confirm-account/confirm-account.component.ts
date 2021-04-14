import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageException } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-dashboard',
  templateUrl: './confirm-account.component.html',
  styleUrls: ['./confirm-account.component.css']
})
export class ConfirmAccountComponent implements OnInit {

  confirmationToken: string;
  messageException: MessageException;
  alert_class: string;
  constructor (
    private router: Router,
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private SpinnerService: NgxSpinnerService
  ) {
    this.messageException = environment.messageExceptionInit;
    this.route.queryParams.subscribe(params => {
      this.confirmationToken = params['confirm'];
    });
    this.alert_class = '';
  }

  ngOnInit(): void {
    this.confirmAccount();
  }

  async confirmAccount() {
    this.SpinnerService.show();
      let postParams = {
        confirmationToken: this.confirmationToken,
      }

      let headers = new HttpHeaders().set("Content-Type", "application/json");

      this.http.post(environment.apiUrl + environment.apiPort + "/user/confirm-account", postParams, {headers})
      .subscribe(data => {
        this.SpinnerService.hide();
        var response: any = data;
        var response_code: number = parseInt(response.confirmationOutcome.code);
        var response_message = response.confirmationOutcome.message;
        switch (response_code) {
          case 10:
            this.messageException = {
              name : '',
              status : 10,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Confirmation token not exists')
            };
            this.alert_class = 'warning';
          break;
          case 11:
            this.messageException = {
              name : '',
              status : 11,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Confirmation token is empty')
            };
            this.alert_class = 'warning';
          break;
          case 20:
            this.messageException = {
              name : '',
              status : 20,
              statusText : this.translate.instant('Sorry'),
              message : this.translate.instant('Account is already confirmed')
            };
            this.alert_class = 'warning';
          break;
          case 202:
            this.messageException = {
              name : '',
              status : 202,
              statusText : this.translate.instant('Congratulations!'),
              message : this.translate.instant('Your account has been confirmed. Now you can Sign in from the App')
            };
            this.alert_class = 'success';
          break;
          case 204:
            this.messageException = {
              name : '',
              status : 204,
              statusText : this.translate.instant('Congratulations!'),
              message : this.translate.instant('Your account has been confirmed. Now you can Sign in')
            };
            this.alert_class = 'success';
          break;
          default:
            this.messageException = {
              name : '',
              status : 1,
              statusText : this.translate.instant('Error'),
              message : response_message
            };
            this.alert_class = 'warning';
            break;
        }

      }, error => {
        this.SpinnerService.hide();
        this.alert_class = 'danger';
        this.messageException = error;
      });
    }

}
