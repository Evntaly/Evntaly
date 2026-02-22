import { HttpService } from '@nestjs/axios';
import { accountRepository } from './account.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';

@Injectable()
export class googleAuthService {
  constructor(
    private readonly accRepository: accountRepository,
    private readonly httpService: HttpService,
  ) {}

  async getGoogleAccountInfo(code: string) {
    const result = await firstValueFrom(this.googleAccessTokenRequest(code));
    const params = Object.fromEntries(new URLSearchParams(result));
    return await firstValueFrom(this.getGoogleUserData(params['access_token']));
  }

  private googleAccessTokenRequest(code: string): Observable<any> {
    console.log(code);
    const request = {
      code,
      client_id: process.env.GOOGL_CLIENT_ID,
      client_secret: process.env.GOOCLE_SECRET,
      redirect_uri: process.env.GOOGLE_REDIERCT_URI,
      grant_type: 'authorization_code',
    };

    return this.httpService
      .post('https://oauth2.googleapis.com/token', request)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          return throwError(() => new InternalServerErrorException(error));
        }),
      );
  }

  private getGoogleUserData(access_token): Observable<any> {
    const request = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    return this.httpService
      .get('https://www.googleapis.com/oauth2/v3/userinfo', request)
      .pipe(map((response) => response.data));
  }
}
