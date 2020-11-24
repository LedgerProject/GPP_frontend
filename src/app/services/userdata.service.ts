import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserdataService {

  constructor() { }

  public current_version = 1001;
  public apiKey = 'GlobalPassport';
  public mainUrl ='https://212.237.19.197/gpp-backend';
  public mainUrlImages ='https://212.237.19.197/gpp-backend';
  public mainPort = '';

  public name = '';
  public first_name = '';
  public last_name = '';

  public email = '';
  public organizations = '';
  public default_organization = '';

  public setName(value) {
    this.name = value;
  }

  public setFirstName(value) {
    this.first_name = value;
  }

  public setLastName(value) {
    this.last_name = value;
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
