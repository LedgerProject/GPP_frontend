import {Component, OnInit } from '@angular/core';
//import { navItems } from '../../_nav';
import { Router, NavigationEnd,ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { UserdataService } from '../../services/userdata.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {

  mySubscription;
  response:any;
  http_response:any;
  organizations: any;

  public uservars: any;
  public isMenuCollapsed = true;
  navbarOpen = false;

  constructor (private router: Router, private activatedRoute: ActivatedRoute,private http:HttpClient,public translate: TranslateService,public userdata: UserdataService,) {
    this.uservars = { name: '', idOrganization: '', default_organization: '', organizations: [], permissions: []};
    this.response = { exit: '', error: '', success: '' };
    this.http_response = null;

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
         // Trick the Router into believing it's last link wasn't previously loaded
         this.router.navigated = false;
      }
    });
  }

  currentRouter = this.router.url;

  ngOnInit() {
    let token = localStorage.getItem('token');
    //console.log(token);
    this.doUsersMe(token);
    //this.doMyOrganizations(token);
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  /*public sidebarMinimized = false;
  //public navItems = navItems;

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }*/

  async doSwitchOrganization(idOrganization) {
    let token = localStorage.getItem('token');

    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/users/change-organization/"+idOrganization, {headers})
    .subscribe(data=> {
      this.http_response = data;
      //console.log(data);
      if (this.http_response.token) {
        localStorage.setItem('token',this.http_response.token);
        this.router.navigate([this.currentRouter]);
      }
    });
  }

async doUsersMe(token) {
if (token) {
  //console.log(token);
    let postParams = {};
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/users/me", {headers})
    .subscribe(data=> {
      //console.log(data);
      this.http_response = data;
      if (this.http_response.idUser) {
        this.response.exit = 1000;
        this.uservars.name = this.http_response.name;
        this.uservars.idOrganization = this.http_response.idOrganization;
        if (this.http_response.idOrganization) {
          localStorage.setItem('idOrganization',this.http_response.idOrganization);
        } else {
          localStorage.setItem('idOrganization','');
        }
        this.uservars.permissions = this.http_response.permissions;
        this.uservars.userType = this.http_response.userType;
        localStorage.setItem('name',this.http_response.name);
        localStorage.setItem('email',this.http_response.email);
        localStorage.setItem('permissions',JSON.stringify(this.http_response.permissions));

        //My Organizations
        this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/users/my-organizations", {headers})
        .subscribe(subdata=> {
          this.organizations = subdata;
          localStorage.setItem('organizations',JSON.stringify(this.organizations));
          if (this.organizations) {
            if (this.uservars.idOrganization) {
              this.organizations.forEach(element => {
                if (element.idOrganization == this.uservars.idOrganization) {
                  this.uservars.default_organization = element.name;
                }
                this.uservars.organizations.push(element);
              });
            }
          }
          //console.log(this.uservars.organizations);
        });
        //

      } else {
        //alert( this.translate.instant('There was a problem, please try again in a few seconds') );
        this.router.navigateByUrl('sign-in');
      }
    });
  } else {
    //alert( this.translate.instant('There was a problem, please try again in a few seconds') );
    this.router.navigateByUrl('sign-in');
  }
  }

  /*doMyOrganizations(token) {
    let postParams = {};
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer "+token)
    ;
    this.http.get(this.userdata.mainUrl+this.userdata.mainPort+"/users/my-organizations", {headers})
    .subscribe(data=> {
      let organizations:any;
      organizations = data;
      if (organizations) {
        if (this.uservars.idOrganization) {
          organizations.forEach(element => {
            if (element.idOrganization == this.uservars.idOrganization) {
              this.uservars.default_organization = element.name;
            }
            this.uservars.organizations.push(element);
          });
        }
      }
      console.log(this.uservars.organizations);
    });
  }*/

  doCreateOrganization() {
    if (!this.uservars.organizations.length) {
      this.router.navigateByUrl('organization-add');
    } else {
      alert( this.translate.instant('There was a problem, please try again in a few seconds') );
    }
  }


}
