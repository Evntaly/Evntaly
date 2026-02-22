import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './events-routing.module';

import * as cmpts from './Components';
import { ThemeModule } from '../theme/theme.module';
import { BaseChartDirective } from 'ng2-charts';
import { NgxEchartsModule, provideEcharts } from 'ngx-echarts';
import {
  provideCharts,
  withDefaultRegisterables,
  } from 'ng2-charts';

import { httpService, lookupsService, permissions, authGuard } from '../core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from '../shared/shared.module';
import { Select2Module } from 'ng-select2-component';

@NgModule({
  declarations: [
    cmpts.EventsListComponent,
    cmpts.EventDetailsComponent,
    cmpts.EmptyStateComponent,
    cmpts.LoadingStateComponent,
    cmpts.NoDataStateComponent,
  ],
  imports: [
    CommonModule,
    EventsRoutingModule,
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
    ClipboardModule,
    SharedModule,
    Select2Module
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
export class EventsModule { }
