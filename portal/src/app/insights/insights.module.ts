import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InsightsRoutingModule } from './insights-routing.module';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NgxEchartsModule, provideEcharts } from 'ngx-echarts';
import { authGuard, httpService, lookupsService, permissions } from '../core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ThemeModule } from '../theme/theme.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as cmpts from './Components';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    cmpts.FeaturesComponent,
    cmpts.TopicsComponent,
    cmpts.UsersComponent,
    cmpts.UserDetailsComponent,
    cmpts.EventsComponent,
    cmpts.ParentEventDetailsComponent,
  ],
  imports: [
    CommonModule,
    InsightsRoutingModule,
    CommonModule,
    ThemeModule,
    MatDialogModule,
    MatTooltipModule,
    BaseChartDirective,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [
    provideCharts(withDefaultRegisterables()),
    provideEcharts(),
    httpService,
    lookupsService,
    HttpClient,
    permissions,
    authGuard,
  ]
})
export class InsightsModule { }
