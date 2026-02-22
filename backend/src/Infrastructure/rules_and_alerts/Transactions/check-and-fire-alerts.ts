import { Injectable, Logger } from '@nestjs/common';
import { alertsService } from '../alerts.service';
import { eventOccurancesService } from 'src/Infrastructure/event_occurances';
import {
  integrationsService,
  slackIntegrationsService,
} from 'src/Infrastructure/integrations';
import { alerts, eventOccurances, integrations, users } from 'src/@domain';
import * as moment from 'moment';
import { mailerService } from 'src/@core/helpers';
import { usersService } from 'src/Infrastructure/users';
import * as Sentry from '@sentry/node';

@Injectable()
export class checkAndFireAlertsTransaction {
  private readonly logger = new Logger(checkAndFireAlertsTransaction.name);
  constructor(
    private evntsOccrnService: eventOccurancesService,
    private alrtService: alertsService,
    private usrService: usersService,
    private integratnsService: integrationsService,
    private slackIntgService: slackIntegrationsService,
    private mailer: mailerService,
  ) {}

  async execute(
    tenantID: string,
    parentEventID: string,
    userID: string,
    projectID: string,
  ) {
    await this.usersAlerts(userID, tenantID, projectID);
    await this.eventsAlerts(parentEventID, tenantID, projectID);
  }

  private async usersAlerts(
    userID: string,
    tenantID: string,
    projectID: string,
  ) {
    try {
      const alert = await this.alrtService.detailsByUserID(
        tenantID,
        projectID,
        userID,
      );

      if (!alert) return;

      const user = await this.usrService.details({
        tenantID: tenantID,
        projectID: projectID,
        userID: userID,
      });
      const integrations = await this.integratnsService.list({
        tenantID: tenantID,
        projectID: projectID,
      });
      if (integrations.length == 0) return;

      const configured_alert_medium = integrations.find(
        (x) => x.name == alert.integrationID,
      );

      return await this.validateAndTriggerAlert(
        configured_alert_medium,
        alert,
        tenantID,
        projectID,
        null,
        user,
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  private async eventsAlerts(
    parentEventID: string,
    tenantID: string,
    projectID: string,
  ) {
    try {
      const alert = await this.alrtService.detailsByParentEventID({
        projectID: projectID,
        tenantID: tenantID,
        parentEventID: parentEventID,
      });

      if (!alert) return;

      const parent_event = await this.evntsOccrnService.details({
        projectID: projectID,
        tenantID: tenantID,
        parentEventID: alert.parentEventID,
      });

      const integrations = await this.integratnsService.list({
        tenantID: tenantID,
        projectID: projectID,
      });

      if (integrations.length == 0) return;

      const configured_alert_medium = integrations.find(
        (x) => x.name == alert.integrationID,
      );

      return await this.validateAndTriggerAlert(
        configured_alert_medium,
        alert,
        tenantID,
        projectID,
        parent_event,
        null,
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  private async validateAndTriggerAlert(
    configured_alert_medium: integrations,
    alert: alerts,
    tenantID: string,
    projectID: string,
    parent_event: eventOccurances = null,
    user: users = null,
  ) {
    try {
      const today = new Date();
      const within_current_timeframe = this.isDateInRange(
        today,
        alert.period_start,
        alert.period_end,
      );

      if (within_current_timeframe) {
        const condition_implementer = this.comparisonOperations['more_than'];
        if (condition_implementer(alert.current_count, alert.occurances)) {
          this.triggerAlert(
            configured_alert_medium,
            alert,
            tenantID,
            projectID,
            parent_event,
            user,
          );

          alert.current_count += 1;
        } else {
          alert.current_count += 1;
        }
      } else {
        const { period_start, period_end } = this.calculatePeriodDates(
          alert.period,
        );

        alert.period_start = period_start;
        alert.period_end = period_end;

        alert.current_count = 1;
      }

      await this.alrtService.update(alert['_id'], alert);
    } catch (error) {
      Sentry.captureException(
        `[checkAndFireAlertsTransaction:=>:validateAndTriggerAlert] Error validating and triggering alert: ${error.message}`,
      );
    }
  }

  //#region Private Helpers ..
  private comparisonOperations = {
    more_than: (a, b) => a > b,
  };

  private isDateInRange(
    dateToCheck: Date,
    startDate: Date,
    endDate: Date,
  ): boolean {
    const momentDateToCheck = moment(dateToCheck);
    const momentStartDate = moment(startDate);
    const momentEndDate = moment(endDate);

    return momentDateToCheck.isBetween(
      momentStartDate,
      momentEndDate,
      undefined,
      '[]',
    );
  }

  private calculatePeriodDates(period: string) {
    const startDate = moment();
    let endDate = moment();

    switch (period.toLowerCase()) {
      case 'hour':
        endDate = moment().add(1, 'hour');
        break;
      case 'day':
        endDate = moment().add(1, 'day');
        break;
      case 'week':
        endDate = moment().add(1, 'week');
        break;
      case 'month':
        endDate = moment().add(1, 'month');
        break;
      default:
        throw new Error('Invalid period specified');
    }

    return {
      period_start: startDate.toDate(),
      period_end: endDate.toDate(),
    };
  }

  private triggerAlert(
    integration: integrations,
    alert: alerts,
    tenantID: string,
    projectID: string,
    event: eventOccurances = null,
    user: users = null,
  ) {
    switch (integration.name) {
      case 'slack':
        this.fireSlackAlert(
          integration,
          alert,
          tenantID,
          projectID,
          event,
          user,
        );
        break;

      case 'email':
        this.fireEmailAlert(integration, alert, event, user);
        break;

      case 'webhook':
        this.fireWebhookAlert();
        break;

      default:
        throw Error('Undefined alert type.');
    }
  }

  private fireSlackAlert(
    integration: integrations,
    alert: alerts,
    tenantID: string,
    projectID: string,
    event: eventOccurances = null,
    user: users = null,
  ) {
    let message = '';
    let title = '';
    let body = '';
    let title_redirect_link = '';
    const ts = new Date().toDateString();
    if (event) {
      message = `🚨 Alert Notification: ${event.title} Event has exceeded the specified threshold.`;
      title = `[Take Care] Event ${event.title} is exceeding the specified threshold`;
      body = `Specified Threshold=${alert.occurances} | Current Occurances=${alert.current_count}\n\n*More Info:*\n Event Name = <${process.env.CLIENT_URL}/insights/event-details/${event.parentEventID}|${event.title}>`;
      title_redirect_link = `<${process.env.CLIENT_URL}/insights/event-details/${event.parentEventID}|${title}>`;
    }

    if (user) {
      message = `🚨 Alert Notification: ${user.full_name} User has exceeded the specified threshold.`;
      title = `[Take Care] User ${user.full_name} is exceeding the specified threshold`;
      body = `Specified Threshold=${alert.occurances} , Current Occurances=${alert.current_count}\n\n*More Info:*\n User Name = <${process.env.CLIENT_URL}/insights/user-details/${user.id}|${user.full_name}>`;
      title_redirect_link = `<${process.env.CLIENT_URL}/insights/user-details/${user.id}|${title}>`;
    }

    this.integratnsService.sendSlackMessage(
      {
        tenantID: tenantID,
        projectID: projectID,
      },
      integration.configurations['channelID'],
      message,
      [
        {
          color: '#ff0000',
          title: title_redirect_link,
          text: body,
          title_link: title_redirect_link,
          footer: 'Evntaly v 1.0.0',
          footer_icon: 'https://cdn.evntaly.com/Resources/notification+(1).png',
          ts: ts,
        },
      ],
    );
  }

  private async fireEmailAlert(
    integration: integrations,
    alert: alerts,
    event: eventOccurances = null,
    user: users = null,
  ) {
    let context;
    let subject;
    let template;

    if (event) {
      context = {
        title: event.title,
        threshold: alert.occurances,
        current_count: alert.current_count,
        event_link: `${process.env.CLIENT_URL}/insights/event-details/${event.parentEventID}`,
      };
      subject = '🚨 Event Alert Notification: Threshold Exceeded';
      template = 'event-alerts';
    }

    if (user) {
      context = {
        full_name: user.full_name,
        threshold: alert.occurances,
        current_count: alert.current_count,
        event_link: `${process.env.CLIENT_URL}/insights/user-details/${user.id}`,
      };
      subject = '🚨 User Alert Notification: Threshold Exceeded';
      template = 'user-alerts';
    }

    const emails = integration.configurations;
    Object.keys(emails).forEach((key) => {
      if (emails[key] != '') {
        this.mailer.sendMail(emails[key], subject, '', template, context, true);
      }
    });
  }

  private fireWebhookAlert() {
    console.log('webhool alert triggered!');
  }
  //#endregion
}
