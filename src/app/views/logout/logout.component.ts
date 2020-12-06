import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})

export class LogoutComponent implements OnInit {
  constructor(private router: Router) { }

  // Page init
  ngOnInit(): void {
    // Reset all the local storage
    localStorage.setItem('token', '');
    localStorage.setItem('name', '');
    localStorage.setItem('email', '');
    localStorage.setItem('organizations', null);
    localStorage.setItem('permissions', '');

    this.router.navigateByUrl('sign-in');
  }
}
