import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';
import { query } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit {

  response:any;
  formData: any;
  http_response:any;
  constructor (private router: Router,public translate: TranslateService,private http:HttpClient,public userdata: UserdataService) {
    this.formData = {first_name: '', last_name: '', email: '', email_confirm: '', password: '', password_confirm: '',secret_key: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
  }

  ngOnInit(): void {

  }


  async doSignOn() {

    let querystring = "";
    let userType = "operator";
    let first_name = this.formData.first_name;
    let last_name = this.formData.last_name;
    let email = this.formData.email;
    let email_confirm = this.formData.email_confirm;
    let password = this.formData.password;
    let password_confirm = this.formData.password_confirm;
    let secret_key = this.formData.secret_key;
    if (secret_key) {
      querystring = "?secretKey="+secret_key;
      userType = "gppOperator";
    }

    if (email != email_confirm) {
      this.response.exit = 1001;
      alert( this.translate.instant('Emails don\'t match') );
    } else if (password != password_confirm) {
      this.response.exit = 1002;
      alert( this.translate.instant('Password don\'t match') );     
    } else if (email && password && first_name && last_name) {

      let postParams = {
        userType: userType,
        email: email,
        password:password,
        firstName: first_name,
        lastName: last_name
      }

      let headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      ;        

      this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/users/signup"+querystring, postParams, {headers}) 
      .subscribe(data=> {
        this.http_response = data;
        console.log(data);
        if (this.http_response.email) {
          this.response.exit = 1000;
        } else {
          alert( this.translate.instant('There was a problem, please try again in a few seconds') );
        }
        
      }, error => {
        let code = error.status;
        if (code == 422) {
          alert( this.translate.instant('Password minimum length is 8 chars') );
        } else if (code == 400) {
          alert( this.translate.instant('The email entered is already registered') );
        } else if (code == 403) {
          alert( this.translate.instant('Secret Key is wrong') );                     
        } else {
          alert( this.translate.instant('There was a problem, please try again in a few seconds') );
        }
        console.log(error); 
      });

    } else {
      this.response.exit = 1003;
      alert( this.translate.instant('There was a problem, please try again in a few seconds') );       
    }

  }  

}
