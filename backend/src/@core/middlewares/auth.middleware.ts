import {
  NestMiddleware,
  HttpStatus,
  Injectable,
  HttpException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'express';
import { account } from 'src/@domain';
import { accountService } from 'src/Infrastructure';

@Injectable()
export class authMiddleware implements NestMiddleware {
  constructor(private acntService: accountService) {}

  async use(req: any, res: Response, next: NextFunction) {
    try {
      const urlPath = (req.path || req.url?.split('?')[0] || '').toLowerCase();

      const restrictedRoutes = [
        '/api/v1/funnels/create',
        '/api/v1/funnels/delete',
        '/api/v1/account/projects/create',
        '/api/v1/account/projects/delete',
        '/api/v1/account/projects/delete-token',
        '/api/v1/account/projects/add-token',
        '/api/v1/account/update-account-settings',
      ];

      const isRestricted = restrictedRoutes.some((route) => {
        const normalizedRoute = route.toLowerCase();
        return (
          urlPath === normalizedRoute ||
          urlPath.startsWith(normalizedRoute + '/')
        );
      });

      if (isRestricted) {
        throw new HttpException(
          'Actions are not allowed in demo mode.',
          HttpStatus.FORBIDDEN,
        );
      }

      const auth_headers = req.headers['authorization'];

      if (auth_headers && (auth_headers as string).split(' ')[1]) {
        const token = (auth_headers as string).split(' ')[1];
        const decoded: any = jwt.verify(token, 'SECRET_KEYS');
        const account: account = await this.acntService.detailsByTenantID(
          decoded.tenantID,
        );

        if (!account) {
          throw new HttpException(
            'Unauthorized access attempt to the dashboard. Please try logging in again or contact support for assistance.',
            HttpStatus.UNAUTHORIZED,
          );
        }
        // req['tenantID'] = account.tenantID;
        req['account'] = account;
        req['projectID'] = req.headers['projectid'];
        next();
      } else {
        throw new HttpException(
          'Unauthorized access attempt to the dashboard.',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unauthorized access attempt to the dashboard. Please try logging in again or contact support for assistance.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
