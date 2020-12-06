import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuickSearch, Document } from '../../services/models';

@Component({
  selector: 'app-wallet-documents',
  templateUrl: './wallet-documents.component.html',
  styleUrls: ['./wallet-documents.component.css']
})

export class WalletDocumentsComponent implements OnInit {
  formSearch: QuickSearch;
  filteredDocuments: Array<Document>;
  allDocuments: Array<Document>;
  constructor (
    private router: Router
  ) {
    this.formSearch = { search: '' };
    this.filteredDocuments = [];
    this.allDocuments = [];
  }

  // Page init
  ngOnInit(): void {
    this.loadDocuments();
  }

  // Documents list
  loadDocuments() {
    this.allDocuments = JSON.parse(localStorage.getItem('documents'));
    let x = 0;

    this.allDocuments.forEach(element => {
      if (element.mimeType == 'image/jpeg' || element.mimeType == 'image/jpg' || element.mimeType == 'image/png') {
        this.allDocuments[x].mimeType = 'image';
      } else {
        this.allDocuments[x].mimeType = 'pdf';
      }
      let bytes: number = element.size / 1000000;
      bytes = parseFloat(bytes.toFixed(2));
      this.allDocuments[x].size = bytes;
      x++;
    });

    this.filteredDocuments = this.allDocuments;
  }

  // Documents filter
  async filterDocuments() {
    let search = this.formSearch.search;

    if (search) {
      this.filteredDocuments = [];
      this.allDocuments.forEach(element => {
        search = search.toLowerCase();
        let title = element.title.toLowerCase();
        if (title.includes(search)) {
          this.filteredDocuments.push(element);
        }
      });
    } else {
      this.filteredDocuments = this.allDocuments;
    }
  }

  // Open document details
  async openDocument(uuid) {
    this.router.navigateByUrl('document-details/' + uuid);
  }
}
