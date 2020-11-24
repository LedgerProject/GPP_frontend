import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

@Component({
  selector: 'app-operator-detail',
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.css']
})
export class OperatorDetailComponent implements OnInit {
  @Input() uuid: string;
  operator: any;
  formData: any;
  response:any; 
  http_response:any;  
  all_operators:any;
  constructor(private _Activatedroute:ActivatedRoute,private http:HttpClient) { 
    this.operator = [];
    this.uuid = this._Activatedroute.snapshot.paramMap.get('uuid');
    this.formData = { token: ''};
    this.response = { exit: '', error: '', success: '' };
    this.all_operators = [];
    this.http_response = null;
  }

  ngOnInit(): void {
    this.doOperators();
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
      this.all_operators.forEach(element => {
        if (element.uuid == this.uuid) {
          this.operator = element;
        }
      });
      //console.log( this.all_operators );
      this.response.error = '';
      this.response.success = 'Operation Completed!'
    }, error => {
      console.log(error); 
      alert('Error');
    });        

}  

async doOperator_save(uuid) {

}

async doOperator_remove(uuid) {

}

}
