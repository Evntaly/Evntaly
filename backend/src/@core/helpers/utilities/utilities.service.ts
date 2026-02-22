import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import axios from 'axios';

@Injectable()
export class utilitiesService {
  constructor() {}

  async sendEventToEvntaly(
    eventData: {
      title: string;
      description: string;
      message: string;
      data: any;
      tags: string[];
      notify?: boolean;
      icon?: string;
      apply_rule_only?: boolean;
      user?: {
        id: string;
      };
      requestContext?: any;
      context?: any;
      type?: string;
      sessionID?: string;
      feature?: string;
      topic?: string;
    },
    credentials: {
      secret: string;
      pat: string;
    },
  ) {
    try {
      const baseUrl =
        process.env.API_BASE_URL || 'https://app.evntaly.com/prod/api/v1';
      const url = `${baseUrl.replace(/\/$/, '')}/register/event`;

      const headers = {
        secret: credentials.secret,
        pat: credentials.pat,
        'Content-Type': 'application/json',
      };

      const payload = {
        title: eventData.title,
        description: eventData.description,
        message: eventData.message,
        data: eventData.data,
        tags: eventData.tags,
        notify: eventData.notify ?? true,
        icon: eventData.icon ?? '📊',
        apply_rule_only: eventData.apply_rule_only ?? false,
        user: eventData.user,
        requestContext: eventData.requestContext,
        context: eventData.context,
        type: eventData.type,
        sessionID: eventData.sessionID,
        feature: eventData.feature,
        topic: eventData.topic,
      };

      const response = await axios.post(url, payload, { headers });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Error sending event to Evntaly:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
      };
    }
  }

  getDateRange(rangeText: string, timezoneOffset: number = 3) {
    let startDate;
    let endDate = moment().utcOffset(timezoneOffset).endOf('day');

    switch (rangeText.toLowerCase()) {
      case 'today':
        startDate = moment().utcOffset(timezoneOffset).startOf('day');
        endDate = moment().utcOffset(timezoneOffset).endOf('day');
        break;
      case 'yesterday':
        startDate = moment()
          .utcOffset(timezoneOffset)
          .subtract(1, 'days')
          .startOf('day');
        endDate = moment()
          .utcOffset(timezoneOffset)
          .subtract(1, 'days')
          .endOf('day');
        break;
      case 'last 7 days':
        startDate = moment()
          .utcOffset(timezoneOffset)
          .subtract(7, 'days')
          .startOf('day');
        endDate = moment().utcOffset(timezoneOffset).endOf('day');
        break;
      case 'last 30 days':
        startDate = moment()
          .utcOffset(timezoneOffset)
          .subtract(30, 'days')
          .startOf('day');
        endDate = moment().utcOffset(timezoneOffset).endOf('day');
        break;
      case 'this week':
        startDate = moment().utcOffset(timezoneOffset).startOf('week');
        endDate = moment().utcOffset(timezoneOffset).endOf('day');
        break;
      case 'last week':
        startDate = moment()
          .utcOffset(timezoneOffset)
          .subtract(1, 'weeks')
          .startOf('week');
        endDate = moment()
          .utcOffset(timezoneOffset)
          .subtract(1, 'weeks')
          .endOf('week');
        break;
      case 'this month':
        startDate = moment().utcOffset(timezoneOffset).startOf('month');
        endDate = moment().utcOffset(timezoneOffset).endOf('day');
        break;
      case 'last 3 months':
        startDate = moment()
          .utcOffset(timezoneOffset)
          .subtract(3, 'months')
          .startOf('day');
        endDate = moment().utcOffset(timezoneOffset).endOf('day');
        break;
      case 'all time':
        startDate = moment('2020-01-01')
          .utcOffset(timezoneOffset)
          .startOf('day');
        endDate = moment().utcOffset(timezoneOffset).endOf('day');
        break;
      default:
        throw new Error('Unsupported range text');
    }

    return {
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
    };
  }

  generateEventID(prefix: string) {
    const timestamp = new Date().getTime().toString();
    const randomDigits = Math.floor(Math.random() * 9000000000) + 1000000000;
    const id = prefix + timestamp + randomDigits;
    return id;
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600); // 1 hour = 3600 seconds
    const minutes = Math.floor((seconds % 3600) / 60); // Remaining minutes
    const secs = Math.floor(seconds % 60); // Remaining seconds

    return `${hours}h ${minutes}m ${secs}s`;
  }

  sortList(
    list: any[],
    attribute: any,
    order: string | 'asc' | 'desc' = 'asc',
  ): any[] {
    return list.sort((a, b) => {
      let valueA = a[attribute];
      let valueB = b[attribute];

      // Handle Date objects differently
      if (valueA instanceof Date && valueB instanceof Date) {
        valueA = valueA.getTime();
        valueB = valueB.getTime();
      }

      // Handle optional values
      if (valueA === undefined) return 1;
      if (valueB === undefined) return -1;

      // Numeric or Date comparison
      const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;

      return order === 'asc' ? comparison : -comparison;
    });
  }

  getPreviousPeriod(startDate: Date, endDate: Date) {
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);

    const duration = currentEnd.getTime() - currentStart.getTime();

    const previousStart = new Date(currentStart.getTime() - duration);
    const previousEnd = new Date(currentEnd.getTime() - duration);

    return {
      startDate: previousStart,
      endDate: previousEnd,
    };
  }
}
