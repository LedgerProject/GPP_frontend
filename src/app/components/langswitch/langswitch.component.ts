import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-langswitch',
  templateUrl: './langswitch.component.html',
  styleUrls: ['./langswitch.component.css']
})
export class LangswitchComponent implements OnInit {

  languages: any;
  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
    this.languages = [{ 'name': 'English', 'value':'en'}];//,{ 'name':'Francais','value':'fr' }];
  }

  ngOnInit(): void {
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('current_lang',lang);
  }

}
