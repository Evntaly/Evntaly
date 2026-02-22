import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as cmpts from './Components';
import { authGuard } from '../core';

const routes: Routes = [
  {
    path: '',
    component: cmpts.DashboardComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
