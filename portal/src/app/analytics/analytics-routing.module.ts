import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import * as cmpts from './Components';

const routes: Routes = [
  {
    path: 'funnels',
    component: cmpts.FunnelsComponent
  },
  {
    path: 'retention',
    component: cmpts.RetentionComponent
  },
  {
    path: 'funnel-details/:id',
    component: cmpts.FunnelDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
