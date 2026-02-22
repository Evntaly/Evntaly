import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { integrationsRepository } from './integrations.repository';
import { createIntegrationsDTO } from './DTOs';
import { integrations } from 'src/@domain';
import { integrationStatus } from 'src/@core/helpers';
import { slackIntegrationsService } from './slack-integrations.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class integrationsService {
  constructor(
    private readonly intgRepository: integrationsRepository,
    private readonly slackService: slackIntegrationsService,
  ) {}

  async create(dto: createIntegrationsDTO) {
    try {
      const new_integration: integrations = {
        ...dto,
        status: integrationStatus.ACTIVE,
      };

      const is_exist = await this.intgRepository.findOneByCondition({
        tenantID: dto.tenantID,
        projectID: dto.projectID,
        name: dto.name,
      });

      if (is_exist) {
        Sentry.captureException(
          `[Integrations-Service:=>:]  Integration already exists, try again.`,
        );
        throw new HttpException(
          `Integration already exists, try again.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (new_integration.name == 'slack') {
        const token = await this.slackService.getAccessToken(
          new_integration.configurations['code'],
        );

        new_integration.configurations['access_token'] = token;
      }
      return await this.intgRepository.create(new_integration);
    } catch (error) {
      Sentry.captureException(
        `[Integrations-Service:=>:create] Error creating integration: ${error.message}`,
      );
      throw new HttpException(
        error.message || 'Error creating integration',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(query, entity) {
    try {
      const existing_integration =
        await this.intgRepository.findOneByCondition(query);

      return await this.intgRepository.updateOneByCondition(
        existing_integration['_id'],
        entity,
      );
    } catch (error) {
      Sentry.captureException(
        `[Integrations-Service:=>:update] Error updating integration: ${error.message}`,
      );
      throw new HttpException(
        error.message || 'Error updating integration',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAll(query) {
    try {
      return await this.intgRepository.deleteManyByCondition(query);
    } catch (error) {
      Sentry.captureException(
        `[Integrations-Service:=>:deleteAll] Error deleting integrations: ${error.message}`,
      );
      throw new HttpException(
        error.message || 'Error deleting integrations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(query) {
    try {
      return await this.intgRepository.findAllByCondition({
        tenantID: query.tenantID,
        projectID: query.projectID,
      });
    } catch (error) {
      Sentry.captureException(
        `[Integrations-Service:=>:list] Error listing integrations: ${error.message}`,
      );
      throw new HttpException(
        error.message || 'Error listing integrations',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSlackChannels(query) {
    try {
      const integration = await this.intgRepository.findOneByCondition({
        tenantID: query.tenantID,
        projectID: query.projectID,
        name: 'slack',
      });

      if (!integration) {
        throw new HttpException(
          'Slack integration not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.slackService.getConversationsList(
        integration.configurations['access_token'],
      );
    } catch (error) {
      Sentry.captureException(
        `[Integrations-Service:=>:getSlackChannels] Error getting Slack channels: ${error.message}`,
      );
      throw new HttpException(
        error.message || 'Error getting Slack channels',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async joinSlackChannel(query, channelID) {
    try {
      const integration = await this.intgRepository.findOneByCondition({
        tenantID: query.tenantID,
        projectID: query.projectID,
        name: 'slack',
      });

      if (!integration) {
        throw new HttpException(
          'Slack integration not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.slackService.joinChannel(
        integration,
        integration.configurations['access_token'],
        channelID,
      );
    } catch (error) {
      Sentry.captureException(
        `[Integrations-Service:=>:joinSlackChannel] Error joining Slack channel: ${error.message}`,
      );
      throw new HttpException(
        error.message || 'Error joining Slack channel',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendSlackMessage(query, channelID, message, attachments) {
    try {
      const integration = await this.intgRepository.findOneByCondition({
        tenantID: query.tenantID,
        projectID: query.projectID,
        name: 'slack',
      });
      console.log(integration);

      if (!integration) {
        throw new HttpException(
          'Slack integration not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.slackService.postMessage(
        integration.configurations['access_token'],
        channelID,
        message,
        attachments,
      );
    } catch (error) {
      Sentry.captureException(
        `[Integrations-Service:=>:sendSlackMessage] Error sending Slack message: ${error.message}`,
      );
      throw new HttpException(
        error.message || 'Error sending Slack message',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
