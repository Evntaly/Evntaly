import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as cmpts from './Components';
import { authGuard } from '../core';

const routes: Routes = [
  {
    path: 'features',
    component: cmpts.FeaturesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'topics',
    component: cmpts.TopicsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users',
    component: cmpts.UsersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'events',
    component: cmpts.EventsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'event-details/:parentEventID',
    component: cmpts.ParentEventDetailsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'user-details/:userID',
    component: cmpts.UserDetailsComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsightsRoutingModule { }
