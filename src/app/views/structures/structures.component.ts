import { LowerCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-structures',
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.css']
})
export class StructuresComponent implements OnInit {
  confirmed_array: any;
  formData: any;
  response:any;
  http_response:any;
  show_structures:any;
  all_structures:any;
  token: any;
  idOrganization:any;

  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_structures = {};
    this.all_structures = {};
    this.confirmed_array = { '':'','10': 'Confirmed', '-1': 'Non Confirmed','1':'Waiting'}
    this.token = localStorage.getItem('token');
    this.idOrganization = localStorage.getItem('idOrganization');
  }

  ngOnInit(): void {
    this.doStructures();
  }

  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_structures = [];
      this.all_structures.forEach(element => {
        search = search.toLowerCase();
        let name = element.structurename.toLowerCase();
        let address = element.address.toLowerCase();
        let city = element.city.toLowerCase();
        let email = element.email.toLowerCase();
        if (name.includes(search) || address.includes(search) || city.includes(search) || email.includes(search)) {
          this.show_structures.push(element);
        }
      });
    } else {
      this.show_structures = this.all_structures;
    }
  }

  async doOpen(id) {
    this.router.navigateByUrl('structure-details/'+id);
  }

  async doStructures() {
      let postParams = {
        //id: id
      }
      let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
      ;
      let filter = '{"fields":{"idStructure":true,"idOrganization":false,"organizationname":false,"alias":true,"structurename":true,"address":true,"city":true,"latitude":false,"longitude":false,"email":true,"phoneNumberPrefix":true,"phoneNumber":true,"website":true,"idIcon":false,"iconimage":true,"iconmarker":false},"offset":0,"limit":100,"skip":0}';
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/structures?filter="+filter, {headers})
      .subscribe(data=> {
        //console.log(data);
        this.http_response = data;
        this.response.exit = 1000;
        let x = 0;
        this.http_response.forEach(element => {
          let icon = this.http_response[x].iconimage;
          this.http_response[x].iconimage = 'data:image/png;base64,'+icon;
          x++;
        });
        this.all_structures = this.http_response;
        this.show_structures = this.all_structures;
        this.response.error = '';
        this.response.success = 'Operation Completed!';
      }, error => {
        console.log(error);
        alert(error);
      });

  }


}
