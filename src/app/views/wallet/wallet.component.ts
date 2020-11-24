import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../../services/userdata.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  formData: any;
  response:any;
  http_response:any;
  token: any;

  constructor (private router: Router,public translate: TranslateService,private http:HttpClient,public userdata: UserdataService) {
    this.formData = { token: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.token = localStorage.getItem('token');
    //gK4H1M
  }

  ngOnInit(): void {

  }

  async doCheck() {
    let token = this.formData.token;

    if (token) {

      let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
      ;

      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/documents/operator/"+token, {headers} )
      .subscribe(data=> {
        this.http_response = data;
        //console.log(data);
        localStorage.setItem('documents',JSON.stringify(this.http_response));
        localStorage.setItem('wallet',token);
        this.response.exit = 1000;
        this.response.error = '';
        this.response.success = 'Operation Completed!'
        this.router.navigateByUrl('documents');
      }, error => {
        console.log(error);
        alert( this.translate.instant('Invalid Token') );
      });
    } else {
      this.response.exit = 1001;
      this.response.error = 'Invalid Token';
      this.response.success = '';
      alert( this.translate.instant('Invalid Token') );
    }
  }

}
