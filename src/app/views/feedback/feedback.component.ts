import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, MessageError } from '../../services/models';
import { NgxSpinnerService } from "ngx-spinner";
interface FeedbackForm {
  title: string;
  description: string;
  email: string;
}

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  formData: FeedbackForm;
  token: string;
  @ViewChild('modalInfo') public modalInfo: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  messageError: MessageError;

  constructor(
    private router: Router,
    private http:HttpClient,
    public translate: TranslateService,
    private SpinnerService: NgxSpinnerService
    ) {
    this.formData = {
      title: '',
      description: '',
      email: ''
    };
    this.token = localStorage.getItem('token');
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
  }

  ngOnInit(): void {
  }

  async sendRequest() {
    this.SpinnerService.show();
    if (this.formData.title.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing Title'),
        this.translate.instant('Title is empty')
      );
      this.SpinnerService.hide();
    } else if (this.formData.description.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing Description'),
        this.translate.instant('Description is empty')
      );
      this.SpinnerService.hide();
    } else if (this.formData.email.length == 0) {
      this.showErrorMessage(
        this.translate.instant('Missing Email'),
        this.translate.instant('Email is empty')
      );
      this.SpinnerService.hide();
    } else {

      let postParams = {
        title: this.formData.title,
        description: this.formData.description,
        email: this.formData.email
      };
      let headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);

      // HTTP Request
      this.http.post(environment.apiUrl + environment.apiPort + "/feedback",postParams, {headers})
      .subscribe(data => {
        this.SpinnerService.hide();
        var response: any = data;
        var response_code: number = parseInt(response.feedbackOutcome.code);
        var response_message = response.changePasswordOutcome.message;
        switch (response_code) {
          case 10:
            this.showErrorMessage(
              this.translate.instant('Sorry'),
              this.translate.instant('Error')
            );
          break;
          case 202:
            this.modalInfo.show();
            this.formData.title = '';
            this.formData.description = '';
            this.formData.email = '';
          break;
          default:
            this.showErrorMessage(
              this.translate.instant('Error'),
              response_message
            );
            break;
        }

      }, error => {
        this.SpinnerService.hide();
        this.showExceptionMessage(error);
      });

    }
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }

  //Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

}
