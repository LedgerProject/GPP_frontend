import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageException } from '../../services/models';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-dashboard',
  templateUrl: './confirm-invitation.component.html',
  styleUrls: ['./confirm-invitation.component.css']
})

export class ConfirmInvitationComponent implements OnInit {
  invitationToken: string;
  messageException: MessageException;
  alertClass: string;
  constructor(
    private http:HttpClient,
    public userdata: UserdataService,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private SpinnerService: NgxSpinnerService
  ) {
    this.messageException = environment.messageExceptionInit;
    this.route.queryParams.subscribe(params => {
      this.invitationToken = params['confirm'];
    });
    this.alertClass = '';
  }

  ngOnInit(): void {
    this.confirmInvitation();
  }

  async confirmInvitation() {
    this.SpinnerService.show();

    let postParams = {
      invitationToken: this.invitationToken,
    }

    let headers = new HttpHeaders().set("Content-Type", "application/json");

    this.http.post(environment.apiUrl + environment.apiPort + "/user/confirm-invitation", postParams, {headers})
    .subscribe(data => {
      this.SpinnerService.hide();

      var response: any = data;
      var response_code: number = parseInt(response.invitationOutcome.code);
      var response_message = response.invitationOutcome.message;

      switch (response_code) {
        case 10:
          this.messageException = {
            name : '',
            status : 10,
            statusText : this.translate.instant('Sorry'),
            message : this.translate.instant('Invitation token not exists')
          };
          this.alertClass = 'warning';
          break;

        case 11:
          this.messageException = {
            name : '',
            status : 11,
            statusText : this.translate.instant('Sorry'),
            message : this.translate.instant('Invitation token is empty')
          };
          this.alertClass = 'warning';
          break;

        case 20:
          this.messageException = {
            name : '',
            status : 20,
            statusText : this.translate.instant('Sorry'),
            message : this.translate.instant('Invitation is already confirmed')
          };
          this.alertClass = 'warning';
          break;

        case 201: case 202:
          this.messageException = {
            name : '',
            status : 201,
            statusText : this.translate.instant('Congratulations!'),
            message : this.translate.instant('Your Invitation has been confirmed successfully')
          };
          this.alertClass = 'success';
          break;

        default:
          this.messageException = {
            name : '',
            status : 1,
            statusText : this.translate.instant('Error'),
            message : response_message
          };
          this.alertClass = 'warning';
          break;
      }
    }, error => {
      this.SpinnerService.hide();

      this.alertClass = 'danger';
      this.messageException = error;
    });
  }
}
