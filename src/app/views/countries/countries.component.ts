import { LowerCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {
  confirmed_array: any;
  formData: any;
  response:any;
  http_response:any;
  show_countries:any;
  all_countries:any;
  token: any;
  idOrganization:any;

  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_countries = [];
    this.all_countries = [];
    this.confirmed_array = { '':'','10': 'Confirmed', '-1': 'Non Confirmed','1':'Waiting'}
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this.doCountries();
  }

  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_countries = [];
      this.all_countries.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.show_countries.push(element);
        }
      });
    } else {
      this.show_countries = this.all_countries;
    }
  }

  async doOpen(id) {
   this.router.navigateByUrl('country-details/'+id);
  }

  async doCountries() {
      let postParams = {
        //id: id
      }
      let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
      ;
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/countries", {headers})
      .subscribe(data=> {
        //console.log(data);
        this.http_response = data;
        this.response.exit = 1000;
        let countries: any = [];
        countries = this.http_response;
        countries.forEach(element => {
          let country: any = {};
          country.idCountry = element.idCountry;
          country.identifier = element.identifier;
          country.name = '';
          country.completed = false;

          this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/countries/"+country.idCountry, {headers})
          .subscribe(completed_data=> {
              let completed: any = completed_data;
              if (completed_data) {
                country.completed = completed.completed;
              }
          });

          this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/countries/"+country.idCountry+"/countries-languages", {headers})
          .subscribe(country_data=> {
              let country: any = country_data;
              if (country) {
                //console.log(country);
              }
          });


          this.all_countries.push(country);
          this.show_countries.push(country);
        });
        //this.all_countries = this.http_response;
        //this.show_countries = this.all_countries;
        this.response.error = '';
        this.response.success = 'Operation Completed!';
      }, error => {
        console.log(error);
        alert(error);
      });

  }


}
