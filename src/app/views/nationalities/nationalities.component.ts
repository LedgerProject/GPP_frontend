import { LowerCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-nationalities',
  templateUrl: './nationalities.component.html',
  styleUrls: ['./nationalities.component.css']
})
export class NationalitiesComponent implements OnInit {
  formData: any;
  response:any;
  http_response:any;
  show_nationalities:any;
  all_nationalities:any;
  token: any;
  idOrganization:any;

  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_nationalities = [];
    this.all_nationalities = [];
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this.donationalities();
  }

  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_nationalities = [];
      this.all_nationalities.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.show_nationalities.push(element);
        }
      });
    } else {
      this.show_nationalities = this.all_nationalities;
    }
  }

  async doOpen(id) {
   this.router.navigateByUrl('nationality-details/'+id);
  }

  async donationalities() {
      let postParams = {
        //id: id
      }
      let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
      ;
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/nationalities", {headers} )
      .subscribe(data=> {
        //console.log(data);
        this.http_response = data;
        this.response.exit = 1000;
        let nationalities: any = [];
        nationalities = this.http_response;
        nationalities.forEach(element => {
          let nationality: any = {};
          nationality.idNationality = element.idNationality;
          nationality.identifier = element.identifier;
          nationality.name = '';

          this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/nationalities/"+nationality.idNationality, {headers})
          .subscribe(completed_data=> {
            //console.log(completed_data);
              /*let completed: any = completed_data;
              if (completed_data) {
                country.completed = completed.completed;
              }*/
          });

          this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/nationalities/"+nationality.idNationality+"/nationalities-languages", {headers})
          .subscribe(nationality_data=> {
              let nationality: any = nationality_data;
              if (nationality) {
                //console.log(country);
              }
          });


          this.all_nationalities.push(nationality);
          this.show_nationalities.push(nationality);
        });
        //this.all_nationalities = this.http_response;
        //this.show_nationalities = this.all_nationalities;
        this.response.error = '';
        this.response.success = 'Operation Completed!';
      }, error => {
        console.log(error);
        alert(error);
      });

  }


}

