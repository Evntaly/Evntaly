import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { alertsService } from '../alerts.service';
import { deleteAlertDTO } from '../DTOs';
import * as Sentry from '@sentry/node';
import { eventOccurancesService } from 'src/Infrastructure/event_occurances';

@Injectable()
export class deleteAlertAndDettachItFromEventTransaction {
  constructor(
    private evntsOccrnService: eventOccurancesService,
    private alrtService: alertsService,
  ) {}

  async excute(dto: deleteAlertDTO) {
    try {
      const parent_event = await this.evntsOccrnService.details({
        tenantID: dto.tenantID,
        projectID: dto.projectID,
        parentEventID: dto.parentEventID,
      });

      if (!parent_event) throw new Error('Event is not found');

      await this.alrtService.delete(dto.tenantID, dto.projectID, dto.alertID);
      parent_event.alert = '';

      return await this.evntsOccrnService.update(parent_event);
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
