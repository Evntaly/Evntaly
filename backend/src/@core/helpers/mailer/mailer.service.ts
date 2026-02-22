import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

import { readFileSync } from 'fs';
import { join } from 'path';
import * as handlebars from 'handlebars';
import * as Sentry from '@sentry/node';

@Injectable()
export class mailerService {
  private resend: Resend | null = null;
  private readonly logger = new Logger(mailerService.name);

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY not set - email sending disabled. Add RESEND_API_KEY to .env to enable.',
      );
    }
  }

  compileTemplate(templateName: string, context: any): string {
    try {
      const templatePath = join(
        process.cwd(),
        'templates',
        `${templateName}.hbs`,
      );
      const templateSource = readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      return compiledTemplate(context);
    } catch (error) {
      Sentry.captureException(
        `[Mailer-Service:=>:compileTemplate] Error compiling template ${templateName}: ${error.message}`,
      );
      this.logger.error(
        `Error compiling template ${templateName}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    templateName?: string,
    context?: any,
    isHTML: boolean = false,
  ) {
    if (!this.resend) {
      this.logger.debug(
        `Email skipped (no API key): ${subject} to ${to}`,
      );
      return { id: null };
    }

    try {
      let html;

      if (isHTML && templateName) {
        html = this.compileTemplate(templateName, context);
      }

      const response: any = await this.resend.emails.send({
        from: 'Alameer from Evntaly <alameer@evntaly.com>',
        to,
        subject,
        text,
        html,
      });

      this.logger.log(
        `Email sent successfully to ${to} with ID: ${response.id}`,
      );
      return response;
    } catch (error) {
      Sentry.captureException(
        `[Mailer-Service:=>:sendMail] Error sending email to ${to}: ${error.message}`,
      );
      this.logger.error(`Error sending email to ${to}: ${error.message}`);
      throw error;
    }
  }
}
