import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalModule } from 'ngx-bootstrap/modal';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AgmCoreModule } from '@agm/core';
import { GeocodeService } from './services/geocode.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { SigninComponent } from './views/signin/signin.component';
import { RegisterComponent } from './views/register/register.component';

import { NgxSpinnerModule } from "ngx-spinner";

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from '@coreui/angular';

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';
import { ForgotpasswordComponent } from './views/forgotpassword/forgotpassword.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LangswitchComponent } from './components/langswitch/langswitch.component';
import { WalletComponent } from './views/wallet/wallet.component';
import { WalletDocumentsComponent } from './views/wallet-documents/wallet-documents.component';
import { WalletDocumentDetailComponent } from './views/wallet-document-detail/wallet-document-detail.component';
import { StructuresComponent } from './views/structures/structures.component';
import { OperatorsComponent } from './views/operators/operators.component';
import { FeedbackComponent } from './views/feedback/feedback.component';
import { AboutUsComponent } from './views/about-us/about-us.component';
import { MyProfileComponent } from './views/my-profile/my-profile.component';
import { ChangePasswordComponent } from './views/change-password/change-password.component';
import { OperatorDetailComponent } from './views/operator-detail/operator-detail.component';
import { OperatorInviteComponent } from './views/operator-invite/operator-invite.component';
import { StructureDetailComponent } from './views/structure-detail/structure-detail.component';
import { LogoutComponent } from './views/logout/logout.component';
import { OrganizationAddComponent } from './views/organization-add/organization-add.component';
import { CountriesComponent } from './views/countries/countries.component';
import { SlugifyPipe } from './services/slugify.pipe';
import { GoogleMapsModule } from '@angular/google-maps';
import { CountryTopicsComponent } from './views/country-topics/country-topics.component';
import { CountryDetailComponent } from './views/country-detail/country-detail.component';
import { CategoriesComponent } from './views/categories/categories.component';
import { CategoryDetailComponent } from './views/category-detail/category-detail.component';
import { NationalitiesComponent } from './views/nationalities/nationalities.component';
import { NationalityDetailComponent } from './views/nationality-detail/nationality-detail.component';
import { IconDetailComponent } from './views/icon-detail/icon-detail.component';
import { IconComponent } from './views/icon/icon.component';
import { ConfirmAccountComponent } from './views/confirm-account/confirm-account.component';
import { ConfirmInvitationComponent } from './views/confirm-invitation/confirm-invitation.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { ContentsComponent } from './views/contents/contents.component';
import { ContentDetailComponent } from './views/content-detail/content-detail.component';
//import { AuthGuardService } from './auth/auth-guard.service';
import { LightboxModule } from 'ngx-lightbox';
@NgModule({
  imports: [
    BrowserModule,GoogleMapsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    FormsModule,ReactiveFormsModule,
    HttpClientModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    AgmCoreModule.forRoot({
      // please get your own API key here:
      // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
      apiKey: 'AIzaSyAdydoW9uSTVMivrrd2fpYCCP-WjxwJyok'
    }),
    NgxSpinnerModule,
    LightboxModule
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    SigninComponent,
    RegisterComponent,
    ForgotpasswordComponent,
    LangswitchComponent,
    WalletComponent,
    WalletDocumentsComponent,
    WalletDocumentDetailComponent,
    StructuresComponent,
    OperatorsComponent,
    FeedbackComponent,
    AboutUsComponent,
    MyProfileComponent,
    ChangePasswordComponent,
    OperatorDetailComponent,
    OperatorInviteComponent,
    StructureDetailComponent,
    LogoutComponent,
    OrganizationAddComponent,
    SlugifyPipe,
    CountriesComponent,
    CountryTopicsComponent,
    CountryDetailComponent,
    CategoriesComponent,
    CategoryDetailComponent,
    NationalitiesComponent,
    NationalityDetailComponent,
    IconDetailComponent,
    IconComponent,
    ConfirmAccountComponent,
    ConfirmInvitationComponent,
    ResetPasswordComponent,
    ContentsComponent,
    ContentDetailComponent
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy,
  },
  GeocodeService,
  SlugifyPipe
  //AuthGuardService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
