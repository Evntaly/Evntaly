import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import * as domain from 'src/@domain';
import * as cntrls from './api';

import {
  createAlertAndAttachItToEntityTransaction,
  deleteAlertAndDettachItFromEventTransaction,
  deleteEventOcuuranceAndUpdateKPIsTransaction,
  deleteAllEventOccurancesTransaction,
  checkAndFireAlertsTransaction,
  funnelRepository,
  funnelService,
  eventOccurancesRepository,
  eventOccurancesService,
  eventsRepository,
  eventsService,
  alertsRepository,
  alertsService,
  sessionsOccurancesRepository,
  sessionsOccurancesService,
  usersOccurancesService,
  userssOccurancesRepository,
  usersRepository,
  usersService,
  lookupsRepository,
  lookupsService,
  integrationsRepository,
  integrationsService,
  slackIntegrationsService,
  eventsInsightsService,
  accountRepository,
  accountService,
  eventsMappingProfile,
  githubAuthService,
  googleAuthService,
} from 'src/Infrastructure';

import { HttpModule } from '@nestjs/axios';
import { mailerService, utilitiesService } from './@core/helpers';
import { accountQuotaChecker, authMiddleware } from './@core/middlewares';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ConfigModule } from '@nestjs/config';
import { SyntheticEventsCronService } from './@core/common/services/synthetic-events-cron.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_CONNECTION),
    MongooseModule.forFeature([
      {
        name: domain.events.name,
        schema: domain.EventsSchema,
      },
      {
        name: domain.eventOccurances.name,
        schema: domain.EventOccurancessSchema,
      },
      {
        name: domain.sessionsOccurances.name,
        schema: domain.SessionsOccurancessSchema,
      },
      {
        name: domain.usersOccurances.name,
        schema: domain.UsersOccurancessSchema,
      },
      {
        name: domain.alerts.name,
        schema: domain.AlertsSchema,
      },
      {
        name: domain.users.name,
        schema: domain.UsersSchema,
      },
      {
        name: domain.lookups.name,
        schema: domain.LookupsSchema,
      },
      {
        name: domain.integrations.name,
        schema: domain.IntegrationsSchema,
      },
      {
        name: domain.account.name,
        schema: domain.AccountsSchema,
      },
      {
        name: domain.funnel.name,
        schema: domain.FunnelSchema,
      },
    ]),
    EventEmitterModule.forRoot(),
    HttpModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
  ],
  controllers: [
    AppController,
    cntrls.eventsController,
    cntrls.alertsController,
    cntrls.registeryController,
    cntrls.lookupController,
    cntrls.integrationsController,
    cntrls.accountController,
    cntrls.featuresController,
    cntrls.topicsController,
    cntrls.usersController,
    cntrls.dashboardController,
    cntrls.sessionsController,
    cntrls.externalHooksController,
    cntrls.adminController,
    cntrls.funnelController,
  ],
  providers: [
    createAlertAndAttachItToEntityTransaction,
    deleteAlertAndDettachItFromEventTransaction,
    deleteEventOcuuranceAndUpdateKPIsTransaction,
    deleteAllEventOccurancesTransaction,
    checkAndFireAlertsTransaction,
    funnelService,
    funnelRepository,
    eventOccurancesService,
    eventOccurancesRepository,
    eventsService,
    eventsRepository,
    alertsRepository,
    alertsService,
    sessionsOccurancesRepository,
    sessionsOccurancesService,
    usersOccurancesService,
    userssOccurancesRepository,
    usersRepository,
    usersService,
    lookupsRepository,
    lookupsService,
    integrationsRepository,
    integrationsService,
    slackIntegrationsService,
    eventsInsightsService,
    mailerService,
    utilitiesService,
    accountRepository,
    accountService,
    eventsMappingProfile,
    githubAuthService,
    googleAuthService,
    SyntheticEventsCronService,
    cntrls.rtGateway,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .exclude(
        'v1/account/create',
        'v1/account/signin',
        'v1/account/github/auth',
        'v1/account/google/auth',
        'v1/account/github/access',
        'v1/account/google/access',
        'v1/account/check-limits/(.*)',
        'v1/account/request-password-reset/(.*)',
        'v1/account/reset-password',
        'v1/register/event',
        'v1/register/user',
        'v1/register/is-allowed',
        'v1/external-hooks/zapier/subscribe',
        'v1/external-hooks/zapier/unsubscribe',
        'v1/admin/send-bulk-email',
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(accountQuotaChecker)
      .exclude('v1/admin/send-bulk-email')
      .forRoutes(
        { path: 'v1/register/event', method: RequestMethod.ALL },
        { path: 'v1/register/user', method: RequestMethod.ALL },
        { path: 'v1/register/is-allowed', method: RequestMethod.ALL },
      );
  }
}
