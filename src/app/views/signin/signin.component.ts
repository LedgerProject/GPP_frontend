import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'signin.component.html'
})
export class SigninComponent implements OnInit {

  response:any;
  formData: any;
  http_response:any;
  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { email: '', password: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
  }

  ngOnInit(): void {

  }


  async doSignIn() {

    let email = this.formData.email;
    let password = this.formData.password;

    let postParams = {
      email: email,
      password:password
    }
    let headers = new HttpHeaders()
      .set("Content-Type", "application/json")
    ;
    if (email && password) {
    this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/users/login", postParams, {headers})
    .subscribe(data=> {
      this.http_response = data;
      let token = this.http_response.token;
      localStorage.setItem('token',token);
      //this.doUsersMe(token);
      //this.doMyOrganizations(token);
      this.router.navigateByUrl('wallet');
      this.response.exit = 1000;
    }, error => {
      let code = error.status;
      if (code == 401) {
        alert( this.translate.instant('Wrong Password') );
      } else if (code == 404) {
        alert( this.translate.instant('User not found') );
      } else if (code == 422) {
        alert( this.translate.instant('Wrong Password') );
      }
      console.log(error);
    });

    } else {
      alert( this.translate.instant('Invalid Credentials') );
    }

  }

}
