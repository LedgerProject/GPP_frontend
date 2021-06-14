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

    let cc = window as any;
    cc.cookieconsent.initialise({
      palette: {
        popup: {
          background: "#446477"
        },
        button: {
          background: "#bf222d",
          text: "#FFF"
        }
      },
      theme: "classic",
      content: {
        message: "This website uses cookies to improve your experience. We'll assume you're ok with this, but you can opt-out if you wish.",
        dismiss: 'Accept',
        link: 'Read more',
        href: "https://www.gppadmin.org/#/cookie-policy"
      }
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

}
