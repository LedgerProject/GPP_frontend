import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-organization-add',
  templateUrl: './organization-add.component.html',
  styleUrls: ['./organization-add.component.css']
})
export class OrganizationAddComponent implements OnInit {

  response:any;
  formData: any;
  http_response:any;
  permissions: any;

  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { organization: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    /*if (this.permissions.indexOf('ProfileEdit') == -1) {
      this.router.navigateByUrl('wallet');
    }*/
  }

  ngOnInit(): void {
  }

  async doSave_organization() {
    let token = localStorage.getItem('token');
    let postParams = {name: this.formData.organization};
      let headers = new HttpHeaders()
        .set("Authorization", "Bearer "+token)
      ;    
      this.http.post(this.userdata.mainUrl+this.userdata.mainPort+"/organizations",postParams, {headers} ) 
      .subscribe(data=> {
        this.http_response = data;
        if (this.http_response.idOrganization) {
          this.response.exit = 1000;
          this.doSignInOrganization(this.http_response.idOrganization, token);
        } else {
          alert( this.translate.instant('There was a problem, please try again in a few seconds') );
        }

      }, error => {
        let code = error.status;
        if (code == 422) {
          alert( this.translate.instant('Organization name is not valid') );
        }
        //console.log(error); 
      });


  }

  doSignInOrganization(idOrganization,token) {

    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;    
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/users/change-organization/"+idOrganization, {headers}) 
    .subscribe(data=> {
      this.http_response = data;
      if (this.http_response.token) {
        localStorage.setItem('token',this.http_response.token);
        localStorage.setItem('idOrganization',idOrganization);
      }
    });

  }

}
