import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  //template: '<router-outlet></router-outlet>'
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private router: Router,public translate: TranslateService) {
    this.translate.setDefaultLang('en');
    let current_lang = localStorage.getItem('current_lang');
    if (current_lang && current_lang !== undefined) {
      this.translate.use(current_lang);
    } else {
      this.translate.use(this.translate.getDefaultLang());
      localStorage.setItem('current_lang',this.translate.getDefaultLang());
    }
   }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

}
