import { Injectable } from '@nestjs/common';
import { alertsRepository } from './alerts.repository';
import { alerts } from 'src/@domain';
import { createAlertDTO } from './DTOs';
import * as moment from 'moment';

@Injectable()
export class alertsService {
  constructor(private readonly alrtsRepository: alertsRepository) {}

  async create(dto: createAlertDTO) {
    const new_alert: alerts = {
      ...dto,
    };

    const { period_start, period_end } = this.calculatePeriodDates(
      new_alert.period,
    );

    new_alert.period_start = period_start;
    new_alert.period_end = period_end;

    return await this.alrtsRepository.create(new_alert);
  }

  details(tenantID: string, parentEventID: string) {
    return this.alrtsRepository.findOneByCondition({
      tenantID: tenantID,
      parentEventID: parentEventID,
    });
  }

  detailsByParentEventID(query) {
    return this.alrtsRepository.findOneByCondition({
      tenantID: query.tenantID,
      projectID: query.projectID,
      parentEventID: query.parentEventID,
    });
  }

  detailsByUserID(tenantID: string, projectID: string, userID: string) {
    return this.alrtsRepository.findOneByCondition({
      tenantID: tenantID,
      projectID: projectID,
      userID: userID,
    });
  }

  async delete(tenantID: string, projectID: string, alertID: string) {
    return await this.alrtsRepository.deleteByCondition({
      tenantID: tenantID,
      projectID: projectID,
      _id: alertID,
    });
  }

  async deleteAll(query) {
    return await this.alrtsRepository.deleteManyByCondition(query);
  }

  async update(query, entity) {
    return await this.alrtsRepository.updateOneByCondition(query, entity);
  }

  //#region Private Helpers..
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
  //#endregion
}
