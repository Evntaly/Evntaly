import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';

import * as cmpts from './Components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    cmpts.ManageAlertsComponent,
    cmpts.RankChartComponent,
    cmpts.FiltersBarComponent,
    cmpts.BlockStateComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTooltipModule,
    HttpClientModule,
    MatTooltipModule,
  ],
  exports: [
    cmpts.ManageAlertsComponent,
    cmpts.RankChartComponent,
    cmpts.FiltersBarComponent,
    cmpts.BlockStateComponent
  ]
})
export class SharedModule { }
