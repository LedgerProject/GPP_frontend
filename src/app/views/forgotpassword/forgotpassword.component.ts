import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './forgotpassword.component.html'
})
export class ForgotpasswordComponent implements OnInit {

  response:any;
  formData: any;
  constructor (private router: Router) {
    this.formData = { email: '' }
    this.response = { exit: '', error: '', success: '' };
  }

  ngOnInit(): void {
    
  }

  async doConfirm() {

    let email = this.formData.email;

    if (email) {
      this.response.exit = 1000;
      this.response.error = '';
      this.response.success = 'Operation Completed!'
    } else {
      this.response.exit = 1001;
      this.response.error = 'Invalid Email';
      this.response.success = '';
    }

  }



}
