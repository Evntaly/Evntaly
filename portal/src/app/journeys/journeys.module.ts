import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JourneysRoutingModule } from './journeys-routing.module';
import * as cmpts from './Components';
import { ThemeModule } from '../theme/theme.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { authGuard, permissions } from '../core';

@NgModule({
  declarations: [
    cmpts.JourneysListComponent
  ],
  imports: [
    CommonModule,
    JourneysRoutingModule,
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
    authGuard,
    permissions
  ]
})
export class JourneysModule { }
