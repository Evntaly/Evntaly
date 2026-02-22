import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Logger,
} from '@nestjs/common';
import { funnelService, createFunnelDto } from 'src/Infrastructure';
import * as Sentry from '@sentry/node';

@Controller({
  path: 'funnels',
  version: '1',
})
export class funnelController {
  private readonly logger = new Logger(funnelController.name);

  constructor(private readonly fnlServc: funnelService) {}

  @Post('create')
  async createFunnel(@Body() dto: createFunnelDto, @Req() req: Request) {
    try {
      this.logger.log(`Creating funnel: ${dto.funnel_name}`);
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      dto.tenantID = tenantID;
      dto.projectID = projectID;

      const funnel = await this.fnlServc.createFunnel(dto);

      return {
        success: true,
        message: 'Funnel created successfully',
        data: {
          id: funnel._id,
          funnel_name: funnel.toObject().funnel_name,
          steps: funnel.toObject().steps,
          status: funnel.toObject().status,
          metadata: funnel.toObject().metadata,
          createdAt: funnel.toObject().createdAt,
          tenantID,
          projectID,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create funnel:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  @Get('list')
  async getFunnels(@Req() req: Request) {
    try {
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      const funnels = await this.fnlServc.getFunnels(tenantID, projectID);

      return {
        success: true,
        data: funnels,
        count: funnels.length,
      };
    } catch (error) {
      this.logger.error('Failed to get funnels:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  @Get('/:id')
  async getFunnel(@Param('id') funnelId: string, @Req() req: Request) {
    try {
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];
      console.log(tenantID, projectID);

      const funnel = await this.fnlServc.getFunnel(
        funnelId,
        tenantID,
        projectID,
      );

      return {
        success: true,
        data: funnel,
      };
    } catch (error) {
      this.logger.error('Failed to get funnel:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  @Get('details/:id/:dateRange')
  async getFunnelAnalytics(
    @Param('id') funnelId: string,
    @Req() req: Request,
    @Param('dateRange') dateRange: string,
  ) {
    try {
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      this.logger.log(
        `Getting funnel analytics for funnel: ${funnelId} with date range: ${dateRange || 'default'}`,
      );

      const funnelWithAnalytics = await this.fnlServc.getFunnelWithAnalytics(
        funnelId,
        tenantID,
        projectID,
        dateRange,
      );

      return {
        success: true,
        data: funnelWithAnalytics,
      };
    } catch (error) {
      this.logger.error('Failed to get funnel analytics:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  @Get('kpis/:id/:dateRange')
  async getFunnelKPIs(
    @Param('id') funnelId: string,
    @Param('dateRange') dateRange: string,
    @Req() req: Request,
  ) {
    try {
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      this.logger.log(
        `Getting funnel KPIs for funnel: ${funnelId} with date range: ${dateRange}`,
      );

      const funnelKPIs = await this.fnlServc.getFunnelKPIs(
        funnelId,
        tenantID,
        projectID,
        dateRange,
      );

      return {
        success: true,
        data: funnelKPIs,
      };
    } catch (error) {
      this.logger.error('Failed to get funnel KPIs:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  @Get('delete/:id')
  async deleteFunnel(@Param('id') funnelId: string, @Req() req: Request) {
    try {
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      const result = await this.fnlServc.deleteFunnel(
        funnelId,
        tenantID,
        projectID,
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to delete funnel:', error);
      Sentry.captureException(error);
      throw error;
    }
  }
}
