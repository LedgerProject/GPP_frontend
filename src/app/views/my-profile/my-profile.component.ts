import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})

export class MyProfileComponent implements OnInit {
  formData: any;
  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = {
      firstName: '',
      lastName: ''
    };
  }

  // Page init
  ngOnInit(): void {}

  // Save profile data
  async saveProfile() {}
}