import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
} from '@nestjs/common';

import {
  eventsInsightsService,
  eventsService,
  usersService,
} from 'src/Infrastructure';

@Controller({
  path: 'sessions',
  version: '1',
})
export class sessionsController {
  private readonly logger = new Logger(sessionsController.name);

  constructor(
    private readonly evntsService: eventsService,
    private readonly usrService: usersService,
    private readonly evenInsgtService: eventsInsightsService,
  ) {}

  @Post('list/:dateRange')
  async listSessions(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
    @Body('criteria')
    criteria?: {
      email?: string;
      name?: string;
      id?: string;
      sessionID?: string;
    },
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const filters = {
      email: criteria.email,
      name: criteria.name,
      id: criteria.id,
      sessionID: criteria.sessionID,
    };

    return await this.evntsService.getDistinctSessionsWithEventCounts(
      tenantID,
      projectID,
      dateRange,
      filters,
    );
  }

  @Get('list-events/:sessionID')
  async listEventsPerSession(
    @Req() req: Request,
    @Param('sessionID') sessionID: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsBySession(
      tenantID,
      projectID,
      sessionID,
    );
  }
}
