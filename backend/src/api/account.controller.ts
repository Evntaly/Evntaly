import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { account } from 'src/@domain';
import {
  authAccountDTO,
  createProjectDTO,
  updateAccountDTO,
  accountService,
  eventsService,
  usersService,
  eventOccurancesService,
  usersOccurancesService,
  sessionsOccurancesService,
  updateAccountSettingsDTO,
  updateAccountProgressDTO,
} from 'src/Infrastructure';

@Controller({
  path: 'account',
  version: '1',
})
export class accountController {
  private readonly logger = new Logger(accountController.name);

  constructor(
    private accService: accountService,
    private evntsService: eventsService,
    private usrService: usersService,
    private evntOccuService: eventOccurancesService,
    private usrOccuService: usersOccurancesService,
    private sessnOccuService: sessionsOccurancesService,
  ) {}

  @Get('is-authorised')
  async isUserAuthorised() {
    try {
      return true;
    } catch (error) {
      this.logger.error('Authorization check failed', error.stack);
      throw error;
    }
  }

  @Post('create')
  async createAccount(@Body() dto: authAccountDTO, @Req() req: Request) {
    try {
      this.logger.log(`Creating new account for email [${dto.email}]`);
      this.logger.debug('Account creation payload', { dto });

      const result = await this.accService.create(dto);

      this.logger.log(
        `Successfully created account with tenant ID [${result.tenantID}]`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create account for email [${dto.email}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('github/access')
  async signinAccountWithGithub(@Res() res: any) {
    try {
      this.logger.log('Initiating GitHub OAuth flow');

      const data = {
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_REDIERCT_URI,
        scope: ['read:user', 'user:email'].join(' '),
        allow_signup: 'true',
      };

      this.logger.debug('GitHub OAuth configuration');

      const params = new URLSearchParams(data).toString();
      res.redirect(`https://github.com/login/oauth/authorize?${params}`);
    } catch (error) {
      this.logger.error('Failed to initiate GitHub OAuth flow', error.stack);
      throw error;
    }
  }

  @Get('github/auth')
  async createAccountWithGithub(
    @Query('code') code: string,
    @Res() res: any,
    @Req() req: Request,
  ) {
    try {
      this.logger.log('Processing GitHub OAuth callback');

      const result = await this.accService.createWithGithub(code, req);

      this.logger.log(
        `Successfully created/authenticated GitHub account for tenant [${result.tenantID}]`,
      );

      res.redirect(
        `${process.env.CLIENT_URL}/account/loading?data=${encodeURIComponent(JSON.stringify(result))}`,
      );
    } catch (error) {
      this.logger.error('Failed to process GitHub OAuth callback', error.stack);
      throw error;
    }
  }

  @Get('google/auth')
  async createAccountWithGoogle(
    @Query('code') code: string,
    @Res() res: any,
    @Req() req: Request,
  ) {
    try {
      this.logger.log('Processing Google OAuth callback');

      const result = await this.accService.createWithGoogle(code, req);

      this.logger.log(
        `Successfully created/authenticated Google account for tenant [${result.tenantID}]`,
      );

      res.redirect(
        `${process.env.CLIENT_URL}/account/loading?data=${encodeURIComponent(JSON.stringify(result))}`,
      );
    } catch (error) {
      this.logger.error('Failed to process Google OAuth callback', error.stack);
      throw error;
    }
  }

  @Get('google/access')
  async signinAccountWithGoogle(@Res() res: any) {
    try {
      this.logger.log('Initiating Google OAuth flow');

      const data = {
        client_id: process.env.GOOGL_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIERCT_URI,
        response_type: 'code',
        scope: 'openid email profile',
      };

      this.logger.debug('Google OAuth configuration');

      const params = new URLSearchParams(data).toString();
      res.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      );
    } catch (error) {
      this.logger.error('Failed to initiate Google OAuth flow', error.stack);
      throw error;
    }
  }

  @Post('signin')
  async signin(@Body() dto: authAccountDTO, @Req() req: Request) {
    try {
      this.logger.log(`Signing in account with email [${dto.email}]`);
      this.logger.debug('Sign in attempt', { email: dto.email });

      const result = await this.accService.login(dto);

      // If the email is from evntaly.com, return the result
      if (result.email.includes('@evntaly.com')) {
        this.logger.log(
          `Internal account login successful [${result.email}] at ${result.last_login_date}`,
        );
        return result;
      }

      this.logger.log(
        `Successfully signed in account with tenant ID [${result.tenantID} | ${result.email}] at ${result.last_login_date}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to sign in account [${dto.email}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('request-password-reset/:email')
  async requestPasswordReset(@Param('email') email: string) {
    try {
      this.logger.log(`Requesting password reset for email [${email}]`);

      const result = await this.accService.requestPasswordReset(email);

      this.logger.log(
        `Successfully requested password reset for email [${email}]`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to request password reset for [${email}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body()
    dto: {
      token: string;
      newPassword: string;
    },
  ) {
    try {
      const result = await this.accService.resetPassword(
        dto.token,
        dto.newPassword,
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to reset password', error.stack);
      throw error;
    }
  }

  @Get('plan')
  async getAccountPlanDetails(@Req() req: any) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(`Fetching plan details for tenant [${tenantID}]`);

      const result = await this.accService.get_account_plan_details(tenantID);

      this.logger.log(
        `Successfully retrieved plan details for tenant [${tenantID}]`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch plan details for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('details')
  async getAccountDetails(@Req() req: any) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(`Fetching account details for tenant [${tenantID}]`);

      const result = await this.accService.get_account_details(tenantID);

      this.logger.log(
        `Successfully retrieved account details for tenant [${tenantID}]`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch account details for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('update')
  async updateAccount(@Req() req: any, @Body() dto: updateAccountDTO) {
    try {
      const account = req.account as account;
      this.logger.log(`Updating account for tenant [${account.tenantID}]`);
      this.logger.debug('Account update payload', { dto });

      account.project_status = dto.project_status;
      account.company_name = dto.company_name;
      account.team_size = dto.team_size;
      account.location = dto.location;

      const result = await this.accService.update(account);

      this.logger.log(
        `Successfully updated account for tenant [${account.tenantID}]`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update account for tenant [${req.account?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('update-account-settings')
  async settingsAccountUpdate(
    @Req() req: any,
    @Body() dto: updateAccountSettingsDTO,
  ) {
    try {
      const account = req.account as account;
      this.logger.log(
        `Updating account settings for tenant [${account.tenantID}]`,
      );
      this.logger.debug('Account settings update payload', { dto });

      account.company_name = dto.company_name;
      account.team_size = dto.team_size;
      account.timezone = dto.timezone;
      account.account_owner_name = dto.account_owner_name;
      account.location = dto.location;

      const result = await this.accService.update(account);

      this.logger.log(
        `Successfully updated account settings for tenant [${account.tenantID}]`,
      );

      return {
        tenantID: result.tenantID,
        email: result.email,
        name: result.account_owner_name,
        developer_secret: result.developer_secret,
        projects: result.projects,
        plan: result.planID,
        licenseStatus: result.license_status,
        referal_code: result.referal_code,
        team_size: result.team_size,
        company: result.company_name,
        location: result.location,
        timezone: result.timezone,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update account settings for tenant [${req.account?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('update-account-progress')
  async progressAccountUpdate(
    @Req() req: any,
    @Body() dto: updateAccountProgressDTO,
  ) {
    try {
      const account = req.account as account;
      this.logger.log(
        `Updating account progress for tenant [${account.tenantID}]`,
      );
      this.logger.debug('Account progress update payload', { dto });

      account.progress = dto;
      const result = await this.accService.update(account);

      this.logger.log(
        `Successfully updated account progress for tenant [${account.tenantID}]`,
      );

      return {
        progress: result.progress,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update account progress for tenant [${req.account?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('delete')
  async deleteAccount(@Req() req: any) {
    try {
      const account = req.account as account;
      this.logger.log(`Deleting account for tenant [${account.tenantID}]`);

      account.is_deleted = true;

      await this.accService.update(account);

      this.logger.log(
        `Successfully deleted account for tenant [${account.tenantID}]`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete account for tenant [${req.account?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('check-limits/:secret')
  async checkLimits(@Param('secret') secret: string) {
    try {
      this.logger.log('Checking account limits');

      const result = await this.accService.checkUserLimits(secret);

      this.logger.log(
        `Successfully checked account limits for account [${secret}]`,
      );
      this.logger.debug('Account limits result', { result });

      return result;
    } catch (error) {
      this.logger.error('Failed to check account limits', error.stack);
      throw error;
    }
  }

  @Post('projects/create')
  async createProject(@Body() dto: createProjectDTO, @Req() req: Request) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(`Creating new project for tenant [${tenantID}]`);

      dto.tenantID = tenantID;

      const result = await this.accService.create_project(dto);

      this.logger.log(`Successfully created project for tenant [${tenantID}]`);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create project for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('projects/delete/:projectID')
  async deleteProject(
    @Req() req: Request,
    @Param('projectID') projectID: string,
  ) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(
        `Deleting project [${projectID}] for tenant [${tenantID}]`,
      );

      const result = await this.accService.delete_project(tenantID, projectID);

      if (result) {
        this.logger.log('Cleaning up related project data');
        await Promise.all([
          this.evntsService.deleteAll({ projectID: projectID }),
          this.usrService.deleteAll({ projectID: projectID }),
          this.evntOccuService.deleteAll({ projectID: projectID }),
          this.usrOccuService.deleteAll({ projectID: projectID }),
          this.sessnOccuService.deleteAll({ projectID: projectID }),
        ]);
        this.logger.log('Successfully cleaned up project data');
      }

      this.logger.log(`Successfully deleted project [${projectID}]`);
    } catch (error) {
      this.logger.error(
        `Failed to delete project [${projectID}] for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('projects/update/:projectID')
  async updateProjectName(
    @Param('projectID') projectID: string,
    @Body() dto: any,
    @Req() req: Request,
  ) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(
        `Updating project name [${projectID}] for tenant [${tenantID}]`,
      );
      this.logger.debug('Project name update payload', { dto });

      const result = await this.accService.update_project_name(
        tenantID,
        projectID,
        dto.name,
      );

      this.logger.log(`Successfully updated project name [${projectID}]`);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update project name [${projectID}] for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('projects/add-token/:projectID')
  async addTokenToProject(
    @Param('projectID') projectID: string,
    @Req() req: Request,
  ) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(
        `Adding token to project [${projectID}] for tenant [${tenantID}]`,
      );

      const token = await this.accService.add_token_to_project(
        tenantID,
        projectID,
      );

      this.logger.log(`Successfully added token to project [${projectID}]`);

      return {
        token: token,
      };
    } catch (error) {
      this.logger.error(
        `Failed to add token to project [${projectID}] for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('projects/delete-token/:token/:projectID')
  async deleteTokenFromProject(
    @Param('token') token: string,
    @Param('projectID') projectID: string,
    @Req() req: Request,
  ) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(
        `Deleting token from project [${projectID}] for tenant [${tenantID}]`,
      );

      const result = await this.accService.delete_token_from_project(
        tenantID,
        projectID,
        token,
      );

      this.logger.log(`Successfully deleted token from project [${projectID}]`);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete token from project [${projectID}] for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('projects/list/tokens')
  async getProjectsTokens(@Req() req: Request) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(`Listing project tokens for tenant [${tenantID}]`);

      const result = await this.accService.get_all_tokens(tenantID);

      this.logger.log(
        `Successfully retrieved project tokens for tenant [${tenantID}]`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to list project tokens for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('projects/list')
  async getProjects(@Req() req: Request) {
    try {
      const tenantID = req['account']!.tenantID;
      this.logger.log(`Listing projects for tenant [${tenantID}]`);

      const result = await this.accService.list_projects(tenantID);

      this.logger.log(
        `Successfully retrieved projects for tenant [${tenantID}]`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to list projects for tenant [${req['account']?.tenantID}]`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('available-plans')
  async getAvailablePlans() {
    return [];
  }
}
