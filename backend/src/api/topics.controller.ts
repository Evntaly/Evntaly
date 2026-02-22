import { Controller, Get, Logger, Param, Query, Req } from '@nestjs/common';

import {
  eventsInsightsService,
  eventsService,
  usersService,
} from 'src/Infrastructure';

@Controller({
  path: 'topics',
  version: '1',
})
export class topicsController {
  private readonly logger = new Logger(topicsController.name);

  constructor(
    private readonly evntsService: eventsService,
    private readonly usrService: usersService,
    private readonly evenInsgtService: eventsInsightsService,
  ) {}

  @Get('list/:dateRange')
  async listTopics(
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

    return await this.evenInsgtService.getTopicsInsightsList(
      tenantID,
      projectID,
      {
        date_range: dateRange,
        sort_as: sortAs == '' ? null : sortAs,
        sort_by: sortBy == '' ? null : sortBy,
        skip: skip || 0,
        limit: limit || 10,
        search_key: searchKey || '',
      },
    );
  }
}
