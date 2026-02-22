import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import * as cmpts from './Components';
import { httpService, lookupsService } from '../core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Select2Module } from 'ng-select2-component';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    cmpts.FunnelsComponent,
    cmpts.RetentionComponent,
    cmpts.CreateFunnelComponent,
    cmpts.FunnelComponent,
    cmpts.FunnelDetailsComponent,
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTooltipModule,
    HttpClientModule,
    MatTooltipModule,
    Select2Module,
    NgxEchartsModule.forRoot({
        echarts: () => import('echarts')
    }),
    SharedModule
],
  providers: [
    httpService,
    lookupsService,
    HttpClient,
  ]
})
export class AnalyticsModule { }
