import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { integrationsRepository } from './integrations.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as Sentry from '@sentry/node';
import { integrations } from 'src/@domain';

@Injectable()
export class slackIntegrationsService {
  private clientId = '7663682153637.7905989770178';
  private clientSecret = 'a37c20011c06061d9b5603fdd5723522';
  private redirectUri = process.env.SLACK_REDIERCT_URI;

  constructor(
    private readonly intgRepository: integrationsRepository,
    private readonly httpService: HttpService,
  ) {}

  async getAccessToken(code: string): Promise<any> {
    const url = 'https://slack.com/api/oauth.v2.access';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const data = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data.toString(), { headers }),
      );

      return response.data['access_token'];
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Slack-Integration-Service:=>: Error fetching access token from Slack:=>:] ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getConversationsList(token: string): Promise<any> {
    const url = 'https://slack.com/api/conversations.list';

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );

      const channels = response.data.channels || [];
      const filteredChannels = channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        name_normalized: channel.name_normalized,
      }));

      return filteredChannels;
    } catch (error) {
      console.error('Error fetching conversations list from Slack:', error);
      throw error;
    }
  }

  async joinChannel(
    integration: integrations,
    token: string,
    channelID: string,
  ): Promise<any> {
    try {
      const url = 'https://slack.com/api/conversations.join';
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const data = {
        channel: channelID,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }),
      );

      integration.configurations['channelID'] = channelID;
      integration.configurations['updatedAt'] = new Date();

      await this.intgRepository.update(integration['_id'], integration);

      // TODO: Return an indecator of joinning success or failure.
      return response.data;
    } catch (error) {
      console.error('Error fetching joinning channel from Slack:', error);
      throw error;
    }
  }

  async postMessage(
    token: string,
    channelID: string,
    text: string,
    attachments: any,
  ): Promise<any> {
    try {
      const url = 'https://slack.com/api/chat.postMessage';
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const data = {
        channel: channelID,
        text,
        attachments: attachments,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }),
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching joinning channel from Slack:', error);
      throw error;
    }
  }
}
