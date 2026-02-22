import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { account } from 'src/@domain';
import { accountService } from 'src/Infrastructure';

@Injectable()
export class accountQuotaChecker implements NestMiddleware {
  constructor(private acntSevice: accountService) {}

  async use(req: any, res: Response, next: NextFunction) {
    const secret = req.headers['secret'];
    const pat = req.headers['pat'];
    const isInternalDemoCall = req.headers['internal-demo-call'];

    const account: account =
      await this.acntSevice.detailsByDeveloperSecret(secret);

    if (account.email === 'demo@evntaly.com' && !isInternalDemoCall) {
      throw new HttpException(
        'Demo mode is enabled. You are not allowed to perform this action.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!account) {
      throw new HttpException(
        'Invalid developer secret.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const pat_validation = await this.acntSevice.validatePAT(pat);

    if (!pat_validation || !pat_validation.is_valid) {
      throw new HttpException(
        'Token is invalid or expired.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      account.details.monthly_consumed_events > account.details.monthly_events
    ) {
      throw new HttpException(
        'Monthly event quota exceeded.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.acntSevice.update_account_quota(
      { developer_secret: account.developer_secret },
      1,
    );

    req.account = account;
    req.projectID = pat_validation.projectID ?? null;

    next();
  }
}
