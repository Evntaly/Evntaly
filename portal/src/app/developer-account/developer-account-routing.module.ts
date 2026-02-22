import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as cmpts from './Components';
import { authGuard } from '../core';
const routes: Routes = [
  {
    path: 'signup',
    component: cmpts.RegisterComponent
  },
  {
    path: 'signin',
    component: cmpts.SigninComponent
  },
  {
    path: 'forget-password',
    component: cmpts.RequestPasswordResetComponent
  },
  {
    path: 'walkthrough',
    component: cmpts.WalkthroughComponent
  },
  {
    path: 'reset-password/:token',
    component: cmpts.ResetPasswordComponent
  },
  {
    path: 'loading',
    component: cmpts.LoginLoadingComponent
  },
  {
    path: 'settings',
    component: cmpts.SettingsComponent,
    children: [
      {
        path: 'projects',
        component: cmpts.ProjectsComponent,
        canActivate: [authGuard]
      },
      {
        path: 'api',
        component: cmpts.TokensComponent,
        canActivate: [authGuard]
      },
      {
        path: 'info',
        component: cmpts.InformationComponent,
        canActivate: [authGuard]
      },
      {
        path: 'security',
        component: cmpts.SecurityComponent,
        canActivate: [authGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeveloperAccountRoutingModule { }
