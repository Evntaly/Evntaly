import { eventsInsightsService, eventsService } from 'src/Infrastructure';
import { usersService } from '../Infrastructure/users/users.service';
import { Controller, Get, Logger, Param, Req } from '@nestjs/common';

@Controller({
  path: 'dashboard',
  version: '1',
})
export class dashboardController {
  private readonly logger = new Logger(dashboardController.name);

  constructor(
    private usrsService: usersService,
    private eventsIngts: eventsInsightsService,
    private evntsService: eventsService,
  ) {}

  @Get('kpis/total-users/:dateRange')
  async getTotalUsersKPI(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const usersData = await this.usrsService.getTotalUsersWithVariance({
      tenantID: tenantID,
      projectID: projectID,
      dateRange: dateRange || 'today',
    });

    return {
      total_users: usersData.current,
      previous_period_users: usersData.previous,
      difference: usersData.difference,
      percentage_change: usersData.percentageChange,
      variance_since_previous: usersData.percentageChange,
    };
  }

  @Get('kpis/active-users/:dateRange')
  async getActiveUsersKPI(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const activeUsersData =
      await this.eventsIngts.getNumberOfActiveUsersWithVariance(
        tenantID,
        projectID,
        dateRange || 'today',
      );

    return {
      active_users: activeUsersData.current,
      previous_period_active_users: activeUsersData.previous,
      difference: activeUsersData.difference,
      percentage_change: activeUsersData.percentageChange,
      variance_since_previous: activeUsersData.percentageChange,
    };
  }

  @Get('kpis/drop-off-rate')
  async getDropOffRateKPI(@Req() req: Request) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const user_count = await this.usrsService.getTotalNumberOfRegisteredUsers({
      tenantID: tenantID,
      projectID: projectID,
      dateRange: '',
    });

    const drop_off_users = await this.eventsIngts.getDropOffUsersCount(
      tenantID,
      projectID,
    );

    const drop_off_count = drop_off_users?.[0]?.dropOffUsers ?? 0;
    const drop_off_rate =
      user_count > 0 ? (drop_off_count / user_count) * 100 : 0;

    return {
      drop_off_rate: drop_off_rate,
    };
  }

  @Get('kpis/online-users')
  async getOnlineUsersKPI(@Req() req: Request) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.eventsIngts.getOnlineUsersWithHistory(
      tenantID,
      projectID,
    );
  }

  @Get('kpis/sessions/:dateRange')
  async getSessionsKPI(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const sessionsData =
      await this.eventsIngts.getUniqueSessionsCountWithVariance(
        tenantID,
        projectID,
        dateRange || 'today',
      );

    return {
      total_sessions: sessionsData.current,
      previous_period_sessions: sessionsData.previous,
      difference: sessionsData.difference,
      percentage_change: sessionsData.percentageChange,
      variance_since_previous: sessionsData.percentageChange,
    };
  }

  @Get('kpis/page-views/:dateRange')
  async getPageViewsKPI(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const pageViewsData =
      await this.eventsIngts.getPageViewEventsCountWithVariance(
        tenantID,
        projectID,
        dateRange || 'today',
      );

    return {
      total_page_views: pageViewsData.current,
      previous_period_page_views: pageViewsData.previous,
      difference: pageViewsData.difference,
      percentage_change: pageViewsData.percentageChange,
      variance_since_previous: pageViewsData.percentageChange,
    };
  }

  //#region Charts
  @Get('registered-users/chart/:dateRange')
  async registeredUsersChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.usrsService.getRegisteredUserChartData(
      tenantID,
      dateRange,
      projectID,
    );
  }

  @Get('active-users/chart/:dateRange')
  async activeUsersChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.eventsIngts.getActiveUsersChartData(
      tenantID,
      dateRange,
      projectID,
    );
  }

  @Get('sessions-count/chart/:dateRange')
  async sessionsCountChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.eventsIngts.getSessionsCountPerDayChartData(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('page-views/chart/:dateRange')
  async pageViewsChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.eventsIngts.getPageViewCountPerDayChartData(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('activation-adoption/chart/:dateRange')
  async activationAdoptionChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const total_users_count = await this.usrsService.count({
      tenantID: tenantID,
      projectID: projectID,
    });

    return await this.evntsService.getActivationEventsAdoptionChartData(
      tenantID,
      projectID,
      dateRange,
      total_users_count,
    );
  }

  @Get('event-type-breakdown/chart/:dateRange')
  async eventTypeBreakdown(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;

    return await this.evntsService.getEventTypeBreakdown(tenantID, dateRange);
  }

  @Get('countries/chart/map/:dateRange')
  async countriesMapChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByCountry(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('cities/chart/:dateRange')
  async citiesMapChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByCity(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('regions/chart/:dateRange')
  async regionsChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByRegion(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('browsers/chart/:dateRange')
  async browsersChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByBrowser(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('utm/source/:dateRange')
  async utmSourceChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByUtmSource(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('utm/medium/:dateRange')
  async utmMediumChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByUtmMedium(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('utm/campaign/:dateRange')
  async utmCampaignChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByUtmCampaign(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('utm/term/:dateRange')
  async utmTermChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByUtmTerm(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('utm/content/:dateRange')
  async utmContentChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByUtmContent(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('traffic-type/chart/:dateRange')
  async trafficTypeChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByTrafficType(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('traffic-source/chart/:dateRange')
  async trafficHostnameChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByHostname(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('browser-versions/chart/:dateRange')
  async browserVersionsChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByBrowserVersion(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('operating-systems/chart/:dateRange')
  async operatingSystemsChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByOS(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('os-versions/chart/:dateRange')
  async osVersionsChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    return await this.evntsService.getEventsCountByOSVersion(
      tenantID,
      projectID,
      dateRange,
    );
  }

  @Get('url-views/chart/:dateRange')
  async urlViewsChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const pageViewsData = await this.evntsService.getPageViewEventsByURL(
      tenantID,
      projectID,
      dateRange || 'today',
    );

    return pageViewsData;
  }

  @Get('device-type/chart/:dateRange')
  async deviceTypeChart(
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const deviceTypeData = await this.evntsService.getEventsCountByDeviceType(
      tenantID,
      projectID,
      dateRange || 'today',
    );

    return deviceTypeData;
  }
  //#endregion Charts
}
