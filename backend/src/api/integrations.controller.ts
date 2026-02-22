import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { integrationsService } from 'src/Infrastructure';
import { createIntegrationsDTO } from 'src/Infrastructure/integrations/DTOs';

@Controller({
  path: 'integrations',
  version: '1',
})
export class integrationsController {
  private readonly logger = new Logger(integrationsController.name);

  constructor(private intgService: integrationsService) {}

  @Post('create')
  async createIntegration(
    @Body() dto: createIntegrationsDTO,
    @Req() req: Request,
  ) {
    try {
      this.logger.log(
        `Creating new integration [${dto.name}] for tenant [${req['account']?.tenantID}]`,
      );

      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];
      dto.tenantID = tenantID;
      dto.projectID = projectID;

      this.logger.debug('Integration creation payload', {
        dto,
        tenantID,
        projectID,
      });

      const result = await this.intgService.create(dto);
      this.logger.log(
        `Successfully created integration [${dto.name}] with ID [${result['_id']}]`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create integration [${dto.name}]: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('update')
  async updateIntegration(
    @Body() dto: createIntegrationsDTO,
    @Req() req: Request,
  ) {
    try {
      this.logger.log(
        `Updating integration [${dto.name}] for tenant [${req['account']?.tenantID}]`,
      );

      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      dto.tenantID = tenantID;
      dto.projectID = projectID;
      dto['updatedAt'] = new Date();

      this.logger.debug('Integration update payload', {
        dto,
        tenantID,
        projectID,
      });

      const result = await this.intgService.update(
        { tenantID: tenantID, projectID: projectID, name: dto.name },
        dto,
      );

      this.logger.log(
        `Successfully updated integration [${dto.name}] with ID [${result['_id']}]`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update integration [${dto.name}]: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('list')
  async listAllIntegrations(@Req() req: Request) {
    try {
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      const result = await this.intgService.list({
        tenantID: tenantID,
        projectID: projectID,
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to list integrations: ${error.message}`,
        error.stack,
      );
      throw error;
    }

    // TODO: Hide access token and code from being exposed in the dashboard
    // const slack_integration = result.find((x) => x.name === 'slack');

    // if (slack_integration?.configurations) {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const { access_token, code, ...updatedConfigurations } =
    //     slack_integration.configurations;
    //   slack_integration.configurations = updatedConfigurations;
    // }
  }

  @Get('list-slack-channels')
  async getSlackChannels(@Req() req: Request) {
    try {
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      this.logger.log(`Fetching Slack channels for tenant [${tenantID}]`);

      const result = await this.intgService.getSlackChannels({
        tenantID: tenantID,
        projectID: projectID,
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch Slack channels: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('join-slack-channel/:channelID')
  async joinSlackChannel(
    @Param('channelID') channelID: string,
    @Req() req: Request,
  ) {
    try {
      const tenantID = req['account']!.tenantID;
      const projectID = req!['projectID'];

      this.logger.log(
        `Joining Slack channel [${channelID}] for tenant [${tenantID}]`,
      );

      const result = await this.intgService.joinSlackChannel(
        {
          tenantID: tenantID,
          projectID: projectID,
        },
        channelID,
      );

      this.logger.log(`Successfully joined Slack channel [${channelID}]`);

      await this.intgService.sendSlackMessage(
        {
          tenantID: tenantID,
          projectID: projectID,
        },
        channelID,
        `👋 Hey, Evntaly is here! You’ll get alerts right in this channel.`,
        [],
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to join Slack channel [${channelID}]: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
