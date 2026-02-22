import { Body, Controller, Logger, Post } from '@nestjs/common';
import { mailerService } from 'src/@core/helpers';
import { accountService } from 'src/Infrastructure/account/account.service';
import * as Sentry from '@sentry/node';

@Controller({
  path: 'admin',
  version: '1',
})
export class adminController {
  private readonly logger = new Logger(adminController.name);

  constructor(
    private readonly mailer: mailerService,
    private readonly accService: accountService,
  ) {}

  // Helper function to add delay
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  @Post('send-bulk-email')
  async sendBulkEmailToAccounts(
    @Body() body: { template: string; subject: string; secret_key: string },
  ) {
    const { template, subject, secret_key } = body;
    if (secret_key !== 'shkdhksgdhksd37946394khbfkhbkhsd') {
      Sentry.captureException('Invalid Admin secret key');
      throw new Error('Invalid Admin secret key');
    }
    try {
      const accounts = await this.accService.list_all_accounts();
      const emails = [];
      const responses = [];

      for (const account of accounts) {
        if (account.email) {
          emails.push(account.email);
        }
      }

      let sent = 0;
      let failed = 0;
      const errors = [];
      for (const email of emails) {
        try {
          const response = await this.mailer.sendMail(
            email,
            subject,
            '',
            template,
            {},
            true,
          );
          responses.push({ email, response });
          sent++;
        } catch (err) {
          failed++;
          errors.push({ email, error: err.message });
          Sentry.captureException(
            `[BulkEmail] Error sending email to ${email}: ${err.message}`,
          );
        }

        // Wait 1 second before next request to respect rate limit (2 requests per second)
        await this.sleep(1000);
        console.log('waiting for 1 second');
      }
      return {
        total: emails.length,
        sent,
        failed,
        errors,
      };
    } catch (err) {
      Sentry.captureException(`[BulkEmail] Fatal error: ${err.message}`);
      throw err;
    }
  }
}
