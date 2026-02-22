import { httpService } from './../core/services/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import * as cmpts from './Components';
import { ThemeModule } from '../theme/theme.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { authGuard, InternalEventsService, permissions } from '../core';

@NgModule({
  declarations: [
    cmpts.DashboardComponent,
    cmpts.KpisComponent,
    cmpts.FeatureAdoptionComponent,
    cmpts.UserBehaviourComponent,
    cmpts.KeyEventsAdoptionComponent,
    cmpts.EventsTypeBreakdownComponent,
    cmpts.SessionActivityComponent,
    cmpts.UserRetentionComponent,
    cmpts.DeviceInsightsComponent,
    cmpts.KpisV2Component,
    cmpts.MapComponent,
    cmpts.CountriesAnalysisComponent,
    cmpts.PagesAnalysisComponent,
    cmpts.BrowserAndOsAnalysisComponent,
    cmpts.UtmParamtersComponent,
    cmpts.TrafficSourceComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    CommonModule,
    ThemeModule,
    MatDialogModule,
    MatTooltipModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [
    httpService,
    HttpClient,
    authGuard,
    permissions,
    InternalEventsService
  ],
})
export class DashboardModule {}
