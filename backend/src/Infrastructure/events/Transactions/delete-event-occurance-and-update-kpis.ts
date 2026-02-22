import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { eventOccurancesService } from 'src/Infrastructure/event_occurances';
import { sessionsOccurancesService } from 'src/Infrastructure/sessions_occurances';
import { eventsService } from '../events.service';
import * as Sentry from '@sentry/node';
import { usersOccurancesService } from 'src/Infrastructure/users_occurances';

@Injectable()
export class deleteEventOcuuranceAndUpdateKPIsTransaction {
  constructor(
    private evntsOccrnService: eventOccurancesService,
    private sessionsOccrnService: sessionsOccurancesService,
    private usrsOccrnService: usersOccurancesService,
    private eventService: eventsService,
  ) {}

  async excute(tenantID: string, eventID: string, projectID: string) {
    let occurances_agg_updated = false;
    let parent_event_id, user_id, session_id;

    try {
      const event = await this.eventService.details(
        tenantID,
        eventID,
        projectID,
      );
      user_id = event.user['id'];
      session_id = event.sessionID;
      parent_event_id = event.parentEventID;

      await this.evntsOccrnService.update_occurance_count(
        {
          tenantID: tenantID,
          parentEventID: event.parentEventID,
        },
        'occurances_count',
        -1,
      );

      await this.usrsOccrnService.update_occurance_count(
        {
          tenantID: tenantID,
          userID: user_id,
          parentEventID: event.parentEventID,
        },
        'occurances_count',
        -1,
      );

      await this.sessionsOccrnService.update_occurance_count(
        {
          tenantID: tenantID,
          sessionID: session_id,
          parentEventID: event.parentEventID,
        },
        'occurances_count',
        -1,
      );
      occurances_agg_updated = true;

      return await this.eventService.deleteSingleOccurance(tenantID, eventID);
    } catch (error) {
      if (occurances_agg_updated) {
        await this.evntsOccrnService.update_occurance_count(
          {
            tenantID: tenantID,
            parentEventID: parent_event_id,
          },
          'occurances_count',
          +1,
        );

        await this.sessionsOccrnService.update_occurance_count(
          {
            tenantID: tenantID,
            userID: user_id,
            parentEventID: parent_event_id,
          },
          'occurances_count',
          +1,
        );

        await this.usrsOccrnService.update_occurance_count(
          {
            tenantID: tenantID,
            sessionID: session_id,
            parentEventID: parent_event_id,
          },
          'occurances_count',
          +1,
        );
      }
      Sentry.captureException(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
