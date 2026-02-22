import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { alertsService } from '../alerts.service';
import { createAlertDTO } from '../DTOs';
import * as Sentry from '@sentry/node';
import { eventOccurancesService } from 'src/Infrastructure/event_occurances';
import { usersService } from 'src/Infrastructure/users';

@Injectable()
export class createAlertAndAttachItToEntityTransaction {
  constructor(
    private evntsOccrnService: eventOccurancesService,
    private userService: usersService,
    private alrtService: alertsService,
  ) {}

  async execute(dto: createAlertDTO, entity: string) {
    try {
      let result;

      switch (entity) {
        case 'events':
          result = this.executeForEvents(dto);
          break;
        case 'users':
          result = this.executeForUsers(dto);
          break;
      }

      return result;
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(`${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async executeForEvents(dto: createAlertDTO) {
    const parent_event = await this.evntsOccrnService.details({
      tenantID: dto.tenantID,
      projectID: dto.projectID,
      parentEventID: dto.parentEventID,
    });

    if (!parent_event) throw new Error('Event is not found');
    if (parent_event.alert != '') throw new Error('Event has an alert already');

    const alert = await this.alrtService.create(dto);

    parent_event.alert = alert['_id'] as string;
    return await this.evntsOccrnService.update(parent_event);
  }

  private async executeForUsers(dto: createAlertDTO) {
    const user = await this.userService.details({
      tenantID: dto.tenantID,
      projectID: dto.projectID,
      userID: dto.userID,
    });

    if (!user) throw new Error('User is not found');
    if (user.alert) {
      throw new HttpException(
        'User has an alert alredy.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const alert = await this.alrtService.create(dto);

    user.alert = alert['_id'] as string;
    return await this.userService.update(user);
  }

  private executeForFeatures() {}

  private executeForTopics() {}
}
