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
  createAlertAndAttachItToEntityTransaction,
  deleteAlertAndDettachItFromEventTransaction,
  createAlertDTO,
  alertsService,
  deleteAlertDTO,
} from 'src/Infrastructure';

@Controller({
  path: 'alerts',
  version: '1',
})
export class alertsController {
  private readonly logger = new Logger(alertsController.name);

  constructor(
    private alrtsService: alertsService,
    private createAlertAndEntityTransaction: createAlertAndAttachItToEntityTransaction,
    private deleteAlertAndEventTransaction: deleteAlertAndDettachItFromEventTransaction,
  ) {}

  @Post('create')
  async createAlert(@Body() dto: createAlertDTO, @Req() req: Request) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    dto.tenantID = tenantID;
    dto.projectID = projectID;

    let target_entity = 'events';
    if (dto.parentEventID) target_entity = 'events';
    if (dto.userID) target_entity = 'users';

    const result = await this.createAlertAndEntityTransaction.execute(
      dto,
      target_entity,
    );

    return result;
  }

  @Get('get-by-parent-event/:parentEventID')
  async getAlertDetailsPerParentEvent(
    @Param('parentEventID') parentEventID,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const result = await this.alrtsService.detailsByParentEventID({
      projectID: projectID,
      tenantID: tenantID,
      parentEventID: parentEventID,
    });
    return result;
  }

  @Get('get-by-user/:userID')
  async getAlertDetailsPerUser(@Param('userID') userID, @Req() req: Request) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const result = await this.alrtsService.detailsByUserID(
      tenantID,
      projectID,
      userID,
    );
    return result;
  }

  @Get('delete-from-events/:alertID/:parentEventID')
  async deleteAlertFromEvents(
    @Param('alertID') alertID,
    @Param('parentEventID') parentEventID,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const dto = new deleteAlertDTO();
    dto.parentEventID = parentEventID;
    dto.alertID = alertID;
    dto.tenantID = tenantID;
    dto.projectID = projectID;

    const result = await this.deleteAlertAndEventTransaction.excute(dto);
    return result;
  }

  @Get('delete-from-users/:alertID/:userID')
  async deleteAlertFromUsers(
    @Param('alertID') alertID,
    @Param('userID') userID,
    @Req() req: Request,
  ) {
    const tenantID = req['account']!.tenantID;
    const projectID = req!['projectID'];

    const result = await this.alrtsService.delete(tenantID, projectID, alertID);
    return result;
  }
}
