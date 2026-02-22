import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { eventOccurancesService } from 'src/Infrastructure/event_occurances';
import { eventsService } from '../events.service';
import { usersOccurancesService } from 'src/Infrastructure/users_occurances';
import { sessionsOccurancesService } from 'src/Infrastructure/sessions_occurances';

@Injectable()
export class deleteAllEventOccurancesTransaction {
  constructor(
    private evntsOccrnService: eventOccurancesService,
    private usrsOccrnService: usersOccurancesService,
    private sesnsOccrnService: sessionsOccurancesService,
    private eventService: eventsService,
  ) {}

  async excute(tenantID: string, parentEventID: string, projectID: string) {
    let parent_event;

    try {
      parent_event = await this.evntsOccrnService.details({
        tenantID: tenantID,
        projectID: projectID,
        parentEventID: parentEventID,
      });

      if (!parent_event) throw new Error('Event is not found');

      await this.eventService.deleteMany(tenantID, parentEventID, projectID);
      await this.usrsOccrnService.deleteMany(
        tenantID,
        parentEventID,
        projectID,
      );
      await this.sesnsOccrnService.deleteMany(
        tenantID,
        parentEventID,
        projectID,
      );

      return await this.evntsOccrnService.delete(tenantID, parentEventID);
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
