import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface OperatorInvitation {
  email: '';
  textInvitation: '';
}

@Component({
  selector: 'app-operator-invite',
  templateUrl: './operator-invite.component.html',
  styleUrls: ['./operator-invite.component.css']
})

export class OperatorInviteComponent implements OnInit {
  formData: OperatorInvitation;
  constructor (
    private router: Router,
    private http:HttpClient
  ) {
    this.formData = {
      email: '',
      textInvitation: ''
    };
  }

  // Page init
  ngOnInit(): void {}

  // Invite operator
  async inviteOperator() {}
}
