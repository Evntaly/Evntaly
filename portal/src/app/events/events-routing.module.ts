import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as cmpts from './Components';
import { authGuard } from '../core';

const routes: Routes = [
  {
    path: 'all',
    component: cmpts.EventsListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'details/:eventID',
    component: cmpts.EventDetailsComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }
