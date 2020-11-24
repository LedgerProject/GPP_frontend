import { LowerCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  formData: any;
  response:any;
  show_documents:any;
  all_documents:any;
  constructor (private router: Router) {
    this.formData = { token: ''};
    this.response = { exit: '', error: '', success: '' };
    this.show_documents = [];
    this.all_documents = [];
  }

  ngOnInit(): void {

    /*let document = {'id':1,'title':'Passport','url':'passport.pdf','size':'1.7 MBytes','icon':'pdf'};
    this.all_documents.push(document);
    document = {'id':2,'title':'Document ID','url':'document_id.jpg','size':'1.2 MBytes','icon':'image'};
    this.all_documents.push(document);
    document = {'id':3,'title':'Vaccinations Page 1','url':'vaccinations_1.jpg','size':'1.0 MBytes','icon':'image'};
    this.all_documents.push(document);
    document = {'id':4,'title':'Vaccinations Page 2','url':'vaccinations_2.jpg','size':'0.8 MBytes','icon':'image'};
    this.all_documents.push(document);
    document = {'id':5,'title':'Vaccinations Page 3','url':'vaccinations_3.jpg','size':'0.5 MBytes','icon':'image'};
    this.all_documents.push(document);

    this.show_documents = this.all_documents;*/
    this.all_documents = JSON.parse(localStorage.getItem('documents'));
    let x = 0;
    this.all_documents.forEach(element => {
      if (element.mimeType == 'image/jpeg' || element.mimeType == 'image/jpg' || element.mimeType == 'image/png') {
        this.all_documents[x].mimeType = 'image';
      } else {
        this.all_documents[x].mimeType = 'pdf';
      }
      let bytes:any = element.size / 1000000;
      bytes = bytes.toFixed(2);
      this.all_documents[x].size = bytes;
      x++;
    });
    this.show_documents = this.all_documents;
    //console.log(this.all_documents);
  }

  async doSearch() {
    let search = this.formData.search;

    if (search) {
      this.response.exit = 1000;
      this.response.error = '';
      this.response.success = 'Operation Completed!'

    } else {
      this.response.exit = 1001;
      this.response.error = 'Nothing Found';
      this.response.success = '';
    }
  }

  async onKey() {
    let search = this.formData.search;

    if (search) {
      this.show_documents = [];
      this.all_documents.forEach(element => {
        search = search.toLowerCase();
        let title = element.title.toLowerCase();
        if (title.includes(search)) {
          this.show_documents.push(element);
        }
      });
    } else {
      this.show_documents = this.all_documents;
    }
  }

  async doOpen(uuid) {
    this.router.navigateByUrl('document-details/'+uuid);
  }

}
