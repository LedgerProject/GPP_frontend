import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  response:any;
  formData: any;
  http_response:any;
  constructor (private router: Router,private http:HttpClient) {
    this.formData = { password: '', password_new: '', password_new_confirm: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
  }

  ngOnInit(): void {
  }

  async doChange_password() {

  }

}
