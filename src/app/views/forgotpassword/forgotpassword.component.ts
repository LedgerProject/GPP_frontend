import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface ForgotPassword {
  email: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './forgotpassword.component.html'
})

export class ForgotpasswordComponent implements OnInit {
  formData: ForgotPassword;
  constructor (private router: Router) {
    this.formData = {
      email: ''
    }
  }

  // Page init
  ngOnInit(): void {}

  // Request change password
  async requestChangePassword() {}
}