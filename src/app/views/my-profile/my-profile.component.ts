import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  response:any;
  formData: any;
  http_response:any;
  permissions: any;
  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { name: localStorage.getItem('name')};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.permissions = localStorage.getItem('permissions');
    if (this.permissions.indexOf('ProfileEdit') == -1) {
      this.router.navigateByUrl('wallet');
    }
  }

  ngOnInit(): void {
  }

  async doSave_profile() {

  }
}
