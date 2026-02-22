import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as cmpts from './index';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { httpService } from '../core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [
    cmpts.FooterComponent,
    cmpts.HeaderComponent,
    cmpts.LayoutComponent,
    cmpts.BasicLayoutComponent,
    cmpts.SidebarComponent,
    cmpts.EmptyStateComponent,
    cmpts.NotificationComponent,
    cmpts.GridPaginationComponent,
    cmpts.HeatmapComponent,
    cmpts.NumberCounterComponent,
  ],
  exports: [
    cmpts.LayoutComponent,
    cmpts.BasicLayoutComponent,
    cmpts.EmptyStateComponent,
    cmpts.NotificationComponent,
    cmpts.GridPaginationComponent,
    cmpts.HeatmapComponent,
    cmpts.NumberCounterComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTooltipModule,
    HttpClientModule,
  ],
  providers: [httpService, HttpClient],
})
export class ThemeModule {}
