import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageException, MessageError, User } from '../../services/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-operator-detail',
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.css']
})

export class OperatorDetailComponent implements OnInit {
  token: string;
  @Input() uuid: string;
  @ViewChild('modalDelete') public modalDelete: ModalDirective;
  @ViewChild('modalError') public modalError: ModalDirective;
  messageError: MessageError;
  errorsDescriptions: string[];
  @ViewChild('modalException') public modalException: ModalDirective;
  messageException: MessageException;
  operator: User;
  constructor(
    private _Activatedroute: ActivatedRoute,
    private http:HttpClient
  ) {
    this.token = localStorage.getItem('token');
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.operator = {
      idUser: 'uuid',
      userType: 'operator',
      firstName: 'John',
      lastName: 'Brown',
      email: 'johnbrown@gmail.com',
      emailConfirmed: false,
      permissions: [],
      idNationality: '',
      gender: '',
      birthday: ''
    };
    this.messageException = environment.messageExceptionInit;
    this.messageError = environment.messageErrorInit;
    this.errorsDescriptions = [];
  }

  // Page init
  ngOnInit(): void {
    this.getOperator();
  }

  // Get operator details
  async getOperator() {
    this.http.get("assets/api/operators.json")
    .subscribe(data => {
    }, error => {
      this.showExceptionMessage(error);
    });
  }

  // Save operator permissions
  async saveOperatorPermissions() {

  }

  // Remove operator from team
  async removeOperatorFromTeam() {

  }

  //Error message
  showErrorMessage(title: string, description: string): void {
    this.messageError.title = title;
    this.messageError.description = description;
    this.modalError.show();
  }

  //Exception message
  showExceptionMessage(error: HttpErrorResponse) {
    this.messageException = { name : error.name, status : error.status, statusText : error.statusText, message : error.message};
    this.modalException.show();
  }
}
