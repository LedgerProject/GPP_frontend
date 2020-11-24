import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {

    localStorage.setItem('token','');

    localStorage.setItem('first_name','');
    localStorage.setItem('last_name','');

    localStorage.setItem('name','');
    localStorage.setItem('email','');

    localStorage.setItem('documents','');
    localStorage.setItem('organizations','');
    localStorage.setItem('permissions','');
    localStorage.setItem('default_organization','');

    this.router.navigateByUrl('sign-in');
  }

}
