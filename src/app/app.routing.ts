import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { SigninComponent } from './views/signin/signin.component';
import { ForgotpasswordComponent } from './views/forgotpassword/forgotpassword.component';
import { RegisterComponent } from './views/register/register.component';
import { WalletComponent } from './views/wallet/wallet.component';
import { StructuresComponent } from './views/structures/structures.component';
import { OperatorsComponent } from './views/operators/operators.component';
import { AboutUsComponent } from './views/about-us/about-us.component';
import { FeedbackComponent } from './views/feedback/feedback.component';
import { DocumentsComponent } from './views/documents/documents.component';
import { DocumentDetailComponent } from './views/document-detail/document-detail.component';
import { OperatorDetailComponent } from './views/operator-detail/operator-detail.component';
import { OperatorInviteComponent } from './views/operator-invite/operator-invite.component';
import { StructureDetailComponent } from './views/structure-detail/structure-detail.component';
import { CountriesComponent } from './views/countries/countries.component';
import { CountryDetailComponent } from './views/country-detail/country-detail.component';
import { CountryTopicsComponent } from './views/country-topics/country-topics.component';
import { CategoriesComponent } from './views/categories/categories.component';
import { CategoryDetailComponent } from './views/category-detail/category-detail.component';
import { IconComponent } from './views/icon/icon.component';
import { IconDetailComponent } from './views/icon-detail/icon-detail.component';
import { NationalitiesComponent } from './views/nationalities/nationalities.component';
import { NationalityDetailComponent } from './views/nationality-detail/nationality-detail.component';

import { MyProfileComponent } from './views/my-profile/my-profile.component';
import { ChangePasswordComponent } from './views/change-password/change-password.component';
import { LogoutComponent } from './views/logout/logout.component';
import { OrganizationAddComponent } from './views/organization-add/organization-add.component';

//import { AuthGuardService as AuthGuard } from './auth/auth-guard.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'sign-in',
    component: SigninComponent,
    data: {
      title: 'Sign in Page'
    }
  },
  {
    path: 'sign-on',
    component: RegisterComponent,
    data: {
      title: 'Sign on Page'
    }
  },
  {
    path: 'forgot-password',
    component: ForgotpasswordComponent,
    data: {
      title: 'Forgot Password Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    //canActivate: [AuthGuard],
    children: [
      {
        path: 'wallet',
        component: WalletComponent,
      },
      {
        path: 'structures',
        component: StructuresComponent,
      },
      {
        path: 'operators',
        component: OperatorsComponent,
      },
      {
        path: 'feedback',
        component: FeedbackComponent,
      },
      {
        path: 'my-profile',
        component: MyProfileComponent,
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'countries',
        component: CountriesComponent,
      },
      {
        path: 'country-details',
        component: CountryDetailComponent,
      },
      {
        path: 'country-details/:uuid',
        component: CountryDetailComponent,
      },
      {
        path: 'country-topics/:uuid',
        component: CountryTopicsComponent,
      },
      {
        path: 'categories',
        component: CategoriesComponent,
      },
      {
        path: 'category-details',
        component: CategoryDetailComponent,
      },
      {
        path: 'category-details/:uuid',
        component: CategoryDetailComponent,
      },
      {
        path: 'nationalities',
        component: NationalitiesComponent,
      },
      {
        path: 'nationality-details',
        component: NationalityDetailComponent,
      },
      {
        path: 'nationality-details/:uuid',
        component: NationalityDetailComponent,
      },
      {
        path: 'icons',
        component: IconComponent,
      },
      {
        path: 'icon-details',
        component: IconDetailComponent,
      },
      {
        path: 'icon-details/:uuid',
        component: IconDetailComponent,
      },
      {
        path: 'documents',
        component: DocumentsComponent,
      },
      {
        path: 'document-details/:uuid',
        component: DocumentDetailComponent,
      },
      {
        path: 'operator-details/:uuid',
        component: OperatorDetailComponent,
      },
      {
        path: 'operator-invite',
        component: OperatorInviteComponent,
      },
      {
        path: 'structure-details/:uuid',
        component: StructureDetailComponent,
      },
      {
        path: 'structure-details',
        component: StructureDetailComponent,
      },
      {
        path: 'about-us',
        component: AboutUsComponent,
      },
      {
        path: 'logout',
        component: LogoutComponent,
      },
      {
        path: 'organization-add',
        component: OrganizationAddComponent,
      },

      {
        path: 'base',
        loadChildren: () => import('./views/base/base.module').then(m => m.BaseModule)
      },
      {
        path: 'buttons',
        loadChildren: () => import('./views/buttons/buttons.module').then(m => m.ButtonsModule)
      },
      {
        path: 'charts',
        loadChildren: () => import('./views/chartjs/chartjs.module').then(m => m.ChartJSModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      /*{
        path: 'icons',
        loadChildren: () => import('./views/icons/icons.module').then(m => m.IconsModule)
      },*/
      {
        path: 'notifications',
        loadChildren: () => import('./views/notifications/notifications.module').then(m => m.NotificationsModule)
      },
      {
        path: 'theme',
        loadChildren: () => import('./views/theme/theme.module').then(m => m.ThemeModule)
      },
      {
        path: 'widgets',
        loadChildren: () => import('./views/widgets/widgets.module').then(m => m.WidgetsModule)
      }
    ]
  },
  { path: '**', component: P404Component }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
