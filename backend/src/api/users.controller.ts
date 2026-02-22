import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { utilitiesService } from 'src/@core/helpers';

import {
  eventsInsightsService,
  eventsService,
  usersOccurancesService,
  usersService,
} from 'src/Infrastructure';

@Controller({
  path: 'users',
  version: '1',
})
export class usersController {
  private readonly logger = new Logger(usersController.name);

  constructor(
    private readonly evntsService: eventsService,
    private readonly userOccuransService: usersOccurancesService,
    private readonly usrService: usersService,
    private readonly evenInsgtService: eventsInsightsService,
    private readonly uti: utilitiesService,
  ) {}

  @Get('active-users/chart/:dateRange')
  async activeUsersChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evenInsgtService.getActiveUsersChartData(
      tenantID,
      dateRange,
      projectID,
    );
  }

  @Get('registered-users/chart/:dateRange')
  async registeredUsersChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.usrService.getRegisteredUserChartData(
      tenantID,
      dateRange,
      projectID,
    );
  }

  @Get('list/:dateRange')
  async listUsers(
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

    const result = await this.usrService.list(tenantID, projectID, {
      date_range: dateRange,
      search_key: searchKey || '',
    });

    const total_count = await this.usrService.count({
      tenantID: tenantID,
      projectID: projectID,
    });
    let plainUsers = result.map((doc: any) => doc.toObject());

    const events_counts =
      await this.userOccuransService.getUsersEventsOccurances(
        result,
        tenantID,
        projectID,
      );

    const weekly_events_counts =
      await this.userOccuransService.getUsersEventsOccurances(
        result,
        tenantID,
        projectID,
        'this week',
      );

    const events_lsa = await this.evntsService.getLastEventSentByManyUsers(
      result,
      tenantID,
      projectID,
    );

    plainUsers = plainUsers.map((user: any) => {
      const user_occurrences = events_counts.find((x) => x.userID === user.id);
      const user_occurrences_weekly = weekly_events_counts.find(
        (x) => x.userID === user.id,
      );

      const last_seen_active = events_lsa.find((x) => x.userID === user.id);

      const total_events = user_occurrences?.total_occurances_count || 0;
      const total_events_weekly =
        user_occurrences_weekly?.total_occurances_count || 0;

      const lsa = last_seen_active?.timestamp || null;

      let is_gold = false;

      if (total_events_weekly > 10) {
        is_gold = true;
      }

      return {
        ...user,
        total_number_of_events: total_events,
        last_seen_active: lsa,
        is_gold_user: is_gold,
      };
    });

    const sorted_list = this.uti.sortList(
      plainUsers,
      sortBy || 'last_seen_active',
      sortAs || 'desc',
    );

    const paginated_result = sorted_list.slice(parseInt(skip), parseInt(limit));
    // Because from the FE I send skip as Index not offset

    return {
      data: paginated_result,
      total_count: total_count,
    };
  }

  @Get('details/:userID')
  async getUserDetails(@Req() req: Request, @Param('userID') userID: string) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const user = await this.usrService.details({
      tenantID: tenantID,
      projectID: projectID,
      userID: userID,
    });

    const first_last_events =
      await this.evntsService.getFirstAndLastEventSentByUser(userID, tenantID);

    const most_used_feature = await this.evntsService.getMostUsedFeaturePerUser(
      userID,
      tenantID,
    );

    const sessions_count =
      await this.evntsService.getNumberOfUniqueSessionsPeryUser(
        userID,
        tenantID,
      );
    const events_count = await this.evntsService.getNumberOfEventsPerUser(
      userID,
      tenantID,
    );

    const sessions_unique_count =
      sessions_count.length !== 0 ? sessions_count[0]['uniqueSessions'] : 0;

    return {
      user: user,
      first_last_events:
        first_last_events.length == 0 ? [] : first_last_events[0],
      most_used_feature:
        most_used_feature.length == 0 ? [] : most_used_feature[0],
      kpis: { sessions_unique_count, events_count },
    };
  }

  @Get('activity/chart/:userID')
  async getUserActivitiesFor3Months(
    @Param('userID') userID: string,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    if (!userID) return new HttpException('', HttpStatus.BAD_REQUEST);

    const user_activity =
      await this.evntsService.getUserActivityDataForLast3Months(
        tenantID,
        userID,
      );

    return user_activity;
  }
}
