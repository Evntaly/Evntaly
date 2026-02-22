import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { utilitiesService } from 'src/@core/helpers';

import {
  deleteAllEventOccurancesTransaction,
  deleteEventOcuuranceAndUpdateKPIsTransaction,
  eventOccurancesService,
  eventsInsightsService,
  eventsService,
  searchCriteria,
  sessionsOccurancesService,
  usersOccurancesService,
  usersService,
} from 'src/Infrastructure';

@Controller({
  path: 'events',
  version: '1',
})
export class eventsController {
  private readonly logger = new Logger(eventsController.name);

  constructor(
    private readonly evntsService: eventsService,
    private readonly usrsService: usersService,
    private readonly evntsOccurncService: eventOccurancesService,
    private readonly sesnsOccuranceService: sessionsOccurancesService,
    private readonly usrsOccuranceService: usersOccurancesService,
    private readonly deleteEventOccuranceTrans: deleteEventOcuuranceAndUpdateKPIsTransaction,
    private readonly deleteAllOccurancesTrans: deleteAllEventOccurancesTransaction,
    private readonly evntInsightService: eventsInsightsService,
    private readonly uti: utilitiesService,
  ) {}

  @Get('occurances/chart/:parentEventID')
  async getEventOcuurancesChartData(
    @Param('parentEventID') parentEventID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    if (!parentEventID) return new HttpException('', HttpStatus.BAD_REQUEST);

    return await this.evntsService.getEventOccurancesData(
      tenantID,
      projectID,
      parentEventID,
    );
  }

  @Get('kpis/:parentEventID')
  async getEventKPIs(
    @Param('parentEventID') parentEventID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const occurances = await this.evntsOccurncService.details({
      tenantID: tenantID,
      projectID: projectID,
      parentEventID: parentEventID,
    });

    const sessions = await this.sesnsOccuranceService.count(
      tenantID,
      projectID,
      parentEventID,
    );

    const users = await this.usrsOccuranceService.count(
      tenantID,
      projectID,
      parentEventID,
    );

    return {
      occurances: { count: occurances.occurances_count },
      sessions: sessions[0],
      users: users[0],
    };
  }

  @Get('occurrence/details/:eventID')
  async getEventDetails(
    @Param('eventID') eventID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const event = await this.evntsService.details(tenantID, eventID, projectID);
    const latest_event_by_user = await this.evntsService.getLastEventSentByUser(
      tenantID,
      projectID,
      event.user?.id,
    );

    //add-projectid
    const user = await this.usrsService.details({
      tenantID: tenantID,
      projectID: projectID,
      userID: event.user?.id,
    });
    const most_adopted_features =
      await this.evntsService.getMostAdoptedFeaturesPerEvent(
        tenantID,
        projectID,
        event.parentEventID,
      );

    const most_interactive_users =
      await this.evntsService.getMostInteractiveUsersPerEvent(
        tenantID,
        projectID,
        event.parentEventID,
      );

    if (most_interactive_users.length > 0) {
      for (const user in most_interactive_users) {
        const user_details = await this.usrsService.details({
          tenantID: tenantID,
          projectID: projectID,
          userID: most_interactive_users[user]['userID'],
        });

        const latest_event = await this.evntsService.getLastEventSentByUser(
          tenantID,
          projectID,
          user_details?.id,
        );

        most_interactive_users[user]['email'] = user_details?.email;
        most_interactive_users[user]['full_name'] =
          user_details?.full_name || 'Unknown User';
        most_interactive_users[user]['latest_event'] = latest_event?.createdAt;
      }
    }

    return {
      event: event,
      user: user,
      user_latest_activity_date:
        user !== null ? latest_event_by_user.createdAt : null,
      user_created_at: user !== null ? user?.createdAt : null,
      most_adopted_features: most_adopted_features || [],
      most_interactive_users: most_interactive_users || [],
    };
  }

  @Get('parent/details/:parentEventID')
  async getParentEventDetails(
    @Param('parentEventID') parentEventID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const event = await this.evntsOccurncService.details({
      tenantID: tenantID,
      projectID: projectID,
      parentEventID: parentEventID,
    });

    const first_and_last_occurance =
      await this.evntInsightService.getFirstAndLastOccurance(
        tenantID,
        projectID,
        event.title,
      );

    const most_adopted_features =
      await this.evntsService.getMostAdoptedFeaturesPerEvent(
        tenantID,
        projectID,
        parentEventID,
      );

    const most_interactive_users =
      await this.evntsService.getMostInteractiveUsersPerEvent(
        tenantID,
        projectID,
        parentEventID,
      );

    if (most_interactive_users.length > 0) {
      for (const user in most_interactive_users) {
        const user_details = await this.usrsService.details({
          tenantID: tenantID,
          projectID: projectID,
          userID: most_interactive_users[user]['userID'],
        });

        const latest_event = await this.evntsService.getLastEventSentByUser(
          tenantID,
          projectID,
          user_details?.id,
        );

        most_interactive_users[user]['email'] = user_details?.email;
        most_interactive_users[user]['full_name'] =
          user_details?.full_name || 'Unknown User';
        most_interactive_users[user]['latest_event'] = latest_event?.createdAt;
      }
    }

    return {
      event: event,
      most_adopted_features: most_adopted_features || [],
      most_interactive_users: most_interactive_users || [],
      last_occurance: first_and_last_occurance[0]['first_occurance'],
      first_occurance: first_and_last_occurance[0]['last_occurance'],
    };
  }

  @Get('delete/:parentEventID')
  async deleteEvent(
    @Param('parentEventID') parentEventID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.deleteAllOccurancesTrans.excute(
      tenantID,
      parentEventID,
      projectID,
    );
  }

  @Get('delete-occurance/:eventID')
  async deleteEventOccurance(
    @Param('eventID') eventID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.deleteEventOccuranceTrans.excute(
      tenantID,
      eventID,
      projectID,
    );
  }

  @Post('list')
  async getEvents(
    @Body('criteria') criteria: searchCriteria,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.list(
      criteria,
      { skip: skip, limit: limit },
      tenantID,
      projectID,
    );
  }

  @Post('group-by-name')
  async groupEventsByName(
    @Body('criteria') criteria: searchCriteria,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.groupEventsByName(
      criteria,
      tenantID,
      projectID,
    );
  }

  @Put('update-status/:eventID')
  async updateEventStatus(
    @Param('eventID') eventID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const event = await this.evntsService.details(tenantID, eventID, projectID);
    event.status = 'Seen';

    return await this.evntsService.update(event);
  }

  @Post('configure-activation-pipeline')
  async configureActivationPipeline(
    @Body('events') events: any[],
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const results = [];

    const titles = events
      .map((event) => event.event_title)
      .filter((title) => title !== undefined);

    const steps_duplicated = new Set(titles).size !== titles.length;

    if (steps_duplicated) {
      throw new HttpException(
        'Not allwed to have 2 events configured for different steps',
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const event of events) {
      const { event_title, event_order } = event;
      if (event_title && event_order) {
        const result =
          await this.evntsOccurncService.configureActivationPipeline(
            event_title,
            event_order,
            tenantID,
            projectID,
          );
        results.push({ event_title, result });
      }
    }

    return {
      message: 'Key events marked successfully',
      data: results,
    };
  }

  @Get('activation-pipeline-events')
  async getActivationEvents(@Req() req: Request) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsOccurncService.getActivationPipelineEvents(
      tenantID,
      projectID,
    );
  }

  @Get('list-parent-events/:dateRange')
  async listParentEvents(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
    @Query('sortBy') sortBy: string,
    @Query('sortAs') sortAs: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
    @Query('searchKey') searchKey: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];
    const events = [];

    const parent_events = await this.evntsOccurncService.listParentEvents(
      tenantID,
      projectID,
      {
        date_range: dateRange,
        sort_by: sortBy,
        sort_as: sortAs,
        search_key: searchKey,
      },
    );

    for (const event of parent_events['data']) {
      const sessions = await this.sesnsOccuranceService.count(
        tenantID,
        projectID,
        event.parentEventID,
      );

      const users = await this.usrsOccuranceService.count(
        tenantID,
        projectID,
        event.parentEventID,
      );

      events.push({
        id: event.parentEventID,
        title: event.title,
        occurances: event.occurances_count,
        sessions: sessions.length == 0 ? 0 : sessions[0]['count'],
        users: users.length == 0 ? 0 : users[0]['count'],
        registeration_date: event.createdAt,
        last_sent: event.updatedAt,
      });
    }

    if (['occurances', 'sessions', 'users'].includes(sortBy)) {
      this.uti.sortList(events, sortBy, sortAs);
    }

    const paginated_result = events.slice(
      parseInt(skip),
      parseInt(skip) + parseInt(limit),
    );

    return {
      data: paginated_result,
      collectionSize: parent_events['collectionSize'],
    };
  }

  @Get('list-pipelines-events')
  async listPipelinesEvents(@Req() req: Request) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const parent_events = await this.evntsOccurncService.listParentEvents(
      tenantID,
      projectID,
      {
        date_range: 'all time',
      },
    );

    return {
      data: parent_events['data'],
      collectionSize: parent_events['collectionSize'],
    };
  }

  @Get('key-events-checklist-for-user/:userID')
  async getKeyEventsChecklistPerUser(
    @Param('userID') userID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getKeyEventsChecklistPerUser(
      tenantID,
      projectID,
      userID,
    );
  }

  @Get('user-vitals/:userID')
  async getUserVitalsBsaedOnSentEvents(
    @Param('userID') userID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const eg_depth = await this.evntsService.getEngagementDepth(
      tenantID,
      userID,
    );

    const br_depth = await this.evntsService.getBounceRate(tenantID, userID);
    const sesn_duration = await this.evntsService.avergaeSessionDuration(
      tenantID,
      userID,
    );

    const general_status = await this.evntsService.calculateUserGeneralStatus(
      tenantID,
      userID,
    );

    return {
      engagement_depth: eg_depth.toFixed(2),
      bounce_rate: br_depth.toFixed(2),
      avg_session_duration: sesn_duration,
      general_status: general_status,
    };
  }
}
