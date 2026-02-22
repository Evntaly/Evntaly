import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as cmpts from './Components';

import { IntegrationsRoutingModule } from './integrations-routing.module';
import { httpService, authGuard, permissions } from '../core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Select2Module } from 'ng-select2-component';

@NgModule({
  declarations: [
    cmpts.EmailIntegrationSettingComponent,
    cmpts.IntegrationsListComponent,
    cmpts.SlackIntegrationSettingComponent
  ],
  imports: [
    CommonModule,
    IntegrationsRoutingModule,
    MatDialogModule,
    MatTooltipModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    Select2Module
  ],
  providers: [
    httpService,
    HttpClient,
    authGuard,
    permissions
  ]
})
export class IntegrationsModule { }
