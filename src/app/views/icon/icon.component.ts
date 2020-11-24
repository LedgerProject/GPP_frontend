import { LowerCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css']
})
export class IconComponent implements OnInit {

  formData: any;
  response:any;
  http_response:any;
  show_icons:any;
  all_icons:any;
  token: any;

  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_icons = {};
    this.all_icons = {};
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this.doIcons();
  }

  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_icons = [];
      this.all_icons.forEach(element => {
        search = search.toLowerCase();
        let name = element.name.toLowerCase();
        if (name.includes(search)) {
          this.show_icons.push(element);
        }
      });
    } else {
      this.show_icons = this.all_icons;
    }
  }

  async doOpen(id) {
    this.router.navigateByUrl('icon-details/'+id);
  }

  async doIcons() {
      let postParams = {
        //id: id
      }
      let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
      ;
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/icons", {headers})
      .subscribe(data=> {
        //console.log(data);
        this.http_response = data;
        this.response.exit = 1000;
        let x = 0;
        this.http_response.forEach(element => {
          let icon = this.http_response[x].image;
          this.http_response[x].image = 'data:image/png;base64,'+icon;
          x++;
        });
        this.all_icons = this.http_response;
        this.show_icons = this.all_icons;
        this.response.error = '';
        this.response.success = 'Operation Completed!';
      }, error => {
        console.log(error);
        alert(error);
      });

  }


}
