import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

@Component({
  selector: 'app-operator-invite',
  templateUrl: './operator-invite.component.html',
  styleUrls: ['./operator-invite.component.css']
})
export class OperatorInviteComponent implements OnInit {

  response:any;
  formData: any;
  http_response:any;
  constructor (private router: Router,private http:HttpClient) {
    this.formData = { email: '', text: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
  }

  ngOnInit(): void {
  }

  async doInvite() {

  }
}
