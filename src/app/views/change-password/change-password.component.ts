import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  formData: ChangePassword;
  constructor (private router: Router,private http:HttpClient) {
    this.formData = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    };
  }

  ngOnInit(): void {
  }

  async changePassword() {}
}