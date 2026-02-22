import { Body, Controller, Get, Logger, Post, Req } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  checkAndFireAlertsTransaction,
  createEventDTO,
  createEventOccuranceDTO,
  createSessionsOccuranceDTO,
  createUserDTO,
  createUsersOccuranceDTO,
  eventOccurancesService,
  eventsService,
  sessionsOccurancesService,
  usersOccurancesService,
  usersService,
} from 'src/Infrastructure';

@Controller({
  path: 'register',
  version: '1',
})
export class registeryController {
  private readonly logger = new Logger(registeryController.name);

  constructor(
    private readonly evntsService: eventsService,
    private readonly usrsServices: usersService,
    private readonly evntsOccurncService: eventOccurancesService,
    private readonly sesnsOccuranceService: sessionsOccurancesService,
    private readonly usrsOccuranceService: usersOccurancesService,
    private readonly checkAlertAndFireTrans: checkAndFireAlertsTransaction,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post('event')
  async registerEvent(@Body() dto: createEventDTO, @Req() req: Request) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const occurance = new createEventOccuranceDTO();
    const session_occurance = new createSessionsOccuranceDTO();
    occurance.tenantID = session_occurance.tenantID = tenantID;
    occurance.projectID = session_occurance.projectID = projectID;
    occurance.title = dto.title;

    const parentEvent: any =
      await this.evntsOccurncService.createOrUpdate(occurance);

    dto.parentEventID = session_occurance.parentEventID =
      parentEvent.parentEventID;

    if (dto.sessionID) {
      session_occurance.sessionID = dto.sessionID;
      await this.sesnsOccuranceService.createOrUpdate(session_occurance);
    }

    if (dto.user != undefined) {
      if (dto.user!['id'] != null) {
        const users_occurance = new createUsersOccuranceDTO();
        users_occurance.userID = dto.user['id'];
        users_occurance.parentEventID = parentEvent.parentEventID;

        const registered_user = await this.usrsServices.details({
          tenantID: tenantID,
          projectID: projectID,
          userID: dto.user['id'],
        });

        if (registered_user) {
          dto.user = {
            id: registered_user.id,
            full_name: registered_user.full_name,
            email: registered_user.email,
          };
        }

        users_occurance.tenantID = tenantID;
        users_occurance.projectID = projectID;
        await this.usrsOccuranceService.createOrUpdate(users_occurance);
      }
    }

    dto.tenantID = tenantID;
    dto.projectID = projectID;
    const result = await this.evntsService.create(dto);

    await this.checkAlertAndFireTrans.execute(
      tenantID,
      parentEvent.parentEventID,
      dto?.user?.id,
      projectID,
    );

    this.eventEmitter.emit('event.created', result);
    return result;
  }

  @Post('user')
  async registerUser(@Body() dto: createUserDTO, @Req() req: Request) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];
    dto.tenantID = tenantID;
    dto.projectID = projectID;

    const result = await this.usrsServices.create(dto);
    return result;
  }

  @Get('is-allowed')
  async isUserAllowedToUseSDKs() {
    try {
      return true;
    } catch (error) {
      this.logger.error('Authorization check failed', error.stack);
      throw error;
    }
  }
}
