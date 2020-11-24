import { LowerCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  formData: any;
  response:any;
  http_response:any;
  show_categories:any;
  all_categories:any;
  token: any;
  idOrganization:any;

  constructor (private router: Router,private http:HttpClient,public userdata: UserdataService,public translate: TranslateService) {
    this.formData = { search: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_categories = [];
    this.all_categories = [];
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this.docategories();
  }

  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_categories = [];
      this.all_categories.forEach(element => {
        search = search.toLowerCase();
        let name = element.identifier.toLowerCase();
        if (name.includes(search)) {
          this.show_categories.push(element);
        }
      });
    } else {
      this.show_categories = this.all_categories;
    }
  }

  async doOpen(id) {
   this.router.navigateByUrl('category-details/'+id);
  }

  async docategories() {
      let postParams = {
        //id: id
      }
      let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+this.token)
      ;
      let filter = '{"where":{"type":"structures"},"fields":{"idCategory":true,"identifier":true,"type":true},"offset":0,"limit":100,"skip":0,"order":["identifier"]}';
      this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/categories?filter="+filter, {headers} )
      .subscribe(data=> {
        //console.log(data);
        this.http_response = data;
        this.response.exit = 1000;
        let categories: any = [];
        categories = this.http_response;
        categories.forEach(element => {
          let category: any = {};
          category.idCategory = element.idCategory;
          category.identifier = element.identifier;
          category.name = '';

          this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/categories/"+category.idCategory, {headers})
          .subscribe(completed_data=> {
            //console.log(completed_data);
              /*let completed: any = completed_data;
              if (completed_data) {
                country.completed = completed.completed;
              }*/
          });

          this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/categories/"+category.idCategory+"/categories-languages", {headers})
          .subscribe(category_data=> {
              let category: any = category_data;
              if (category) {
                //console.log(country);
              }
          });


          this.all_categories.push(category);
          this.show_categories.push(category);
        });
        //this.all_categories = this.http_response;
        //this.show_categories = this.all_categories;
        this.response.error = '';
        this.response.success = 'Operation Completed!';
      }, error => {
        console.log(error);
        alert(error);
      });

  }


}

