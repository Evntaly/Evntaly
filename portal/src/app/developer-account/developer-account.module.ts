import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeveloperAccountRoutingModule } from './developer-account-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as cmpts from './Components';
import { MatDialogModule } from '@angular/material/dialog';
import {
  provideHighlightOptions,
  Highlight,
  HighlightAuto,
} from 'ngx-highlightjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { httpService, authGuard, permissions } from '../core';
import { Select2Module } from 'ng-select2-component';


@NgModule({
  declarations: [
    cmpts.RegisterComponent,
    cmpts.OnBoardingComponent,
    cmpts.GeneralInfoComponent,
    cmpts.InitAppTokenComponent,
    cmpts.SdkIntegrationComponent,
    cmpts.SendExperimentalEventComponent,
    cmpts.SettingsComponent,
    cmpts.ProjectsComponent,
    cmpts.CreateProjectComponent,
    cmpts.SigninComponent,
    cmpts.TokensComponent,
    cmpts.GenerateNewTokenComponent,
    cmpts.InformationComponent,
    cmpts.SecurityComponent,
    cmpts.LoginLoadingComponent,
    cmpts.RequestPasswordResetComponent,
    cmpts.ResetPasswordComponent,
    cmpts.WalkthroughComponent,
  ],
  imports: [
    CommonModule,
    DeveloperAccountRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTooltipModule,
    Highlight,
    HttpClientModule,
    HighlightAuto,
    Select2Module,
  ],
  providers: [
    httpService,
    HttpClient,
    authGuard,
    permissions,
    // provideHighlightOptions({
    //   coreLibraryLoader: () => import('highlight.js/lib/core'),
    //   languages: {
    //     typescript: () => import('highlight.js/lib/languages/typescript'),
    //   },
    // }),
  ]
})
export class DeveloperAccountModule { }
