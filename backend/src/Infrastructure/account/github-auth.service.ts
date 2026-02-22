import { HttpService } from '@nestjs/axios';
import { accountRepository } from './account.repository';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, map, Observable } from 'rxjs';

@Injectable()
export class githubAuthService {
  constructor(
    private readonly accRepository: accountRepository,
    private readonly httpService: HttpService,
  ) {}

  async getGithubAccountInfo(code: string) {
    const result = await firstValueFrom(this.gitHubAccessTokenRequest(code));
    const params = Object.fromEntries(new URLSearchParams(result));
    return await firstValueFrom(this.getGitHubUserData(params['access_token']));
  }

  private gitHubAccessTokenRequest(code: string): Observable<any> {
    const request = {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SECRET,
        redirect_uri: process.env.GITHUB_REDIERCT_URI,
        code,
      },
    };

    return this.httpService
      .get('https://github.com/login/oauth/access_token', request)
      .pipe(map((response) => response.data));
  }

  private getGitHubUserData(access_token): Observable<any> {
    const request = {
      headers: {
        Authorization: `token ${access_token}`,
      },
    };

    return this.httpService
      .get('https://api.github.com/user', request)
      .pipe(map((response) => response.data));
  }
}
