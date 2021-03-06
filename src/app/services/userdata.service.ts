import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserdataService {

  constructor() { }

  public current_version = 1001;

  public name = '';

  public email = '';
  public organizations = '';
  public default_organization = '';

  public setName(value) {
    this.name = value;
  }

  public setEmail(value) {
    this.email = value;
  }

  public setOrganizations(value) {
    this.organizations = value;
  }

  public setDefaultOrganization(value) {
    this.default_organization = value;
  }
}
