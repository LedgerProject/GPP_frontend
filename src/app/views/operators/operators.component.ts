import { LowerCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css']
})
export class OperatorsComponent implements OnInit {
  levels_array: any;
  formData: any;
  response:any; 
  http_response:any;
  show_operators:any; 
  all_operators:any;
  constructor (private router: Router,private http:HttpClient) {
    this.formData = { token: ''};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;
    this.show_operators = [];
    this.all_operators = [];
    this.levels_array = { '':'','admin': 'Administrator', 'wallet': 'Wallet','structures':'Structures','operators':'Operators' }
  }

  ngOnInit(): void {
    this.doOperators();
  }
  
  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_operators = [];
      this.all_operators.forEach(element => {
        search = search.toLowerCase();
        let first_name = element.first_name.toLowerCase();
        let last_name = element.last_name.toLowerCase();
        let email = element.email.toLowerCase();
        let full_name = first_name+' '+last_name;

        if (first_name.includes(search) || last_name.includes(search) || email.includes(search) || full_name.includes(search)) {
          this.show_operators.push(element);
        }
      });
    } else {
      this.show_operators = this.all_operators;
    }
  }

  async doOpen(uuid) {
    this.router.navigateByUrl('operator-details/'+uuid);
  }

  async doOperators() {

      let postParams = {
        //id: id
      }
  
      //this.http.post( ("assets/api/operators.json"), postParams)
      this.http.get("assets/api/operators.json")//, postParams)    
      .subscribe(data=> {
        this.http_response = data;
        this.response.exit = 1000;
        this.all_operators = this.http_response.operators;
        this.show_operators = this.all_operators;
        //console.log( this.all_operators );
        this.response.error = '';
        this.response.success = 'Operation Completed!'
      }, error => {
        console.log(error); 
        alert('Error');
      });        
  
  }  
  

}
