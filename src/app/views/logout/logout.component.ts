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
    localStorage.setItem('idUser','');
    localStorage.setItem('name', '');
    localStorage.setItem('email', '');
    localStorage.setItem('permissions', '');
    localStorage.setItem('wallet', '');
    localStorage.setItem('userType', '');
    localStorage.setItem('idOrganization', '');
    localStorage.setItem('documents', '');
    localStorage.setItem('organizations', null);

    this.router.navigateByUrl('sign-in', { replaceUrl: true });
  }
}
