import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { accountRepository } from './account.repository';
import {
  authAccountDTO,
  createProjectDTO,
  githubAuthAccountDTO,
  googleAuthAccountDTO,
} from './DTOs';
import { account } from 'src/@domain';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { githubAuthService } from './github-auth.service';
import { googleAuthService } from './google-auth.service';
import { mailerService } from 'src/@core/helpers';
import * as Sentry from '@sentry/node';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
@Injectable()
export class accountService {
  constructor(
    private readonly accRepository: accountRepository,
    private readonly httpService: HttpService,
    private readonly githubauth: githubAuthService,
    private readonly googleauth: googleAuthService,
    private readonly mailer: mailerService,
  ) {}
  private readonly logger = new Logger(accountService.name);

  async create(dto: authAccountDTO) {
    try {
      const errors = await validate(dto);

      if (errors.length > 0) {
        this.logger.error(
          'Account Creation Failed - Invalid inputs -> ',
          errors,
        );
        throw new HttpException(
          {
            message:
              'Create Account Failed - Invalid inputs, check error fields you entered.',
            errors: errors,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const new_account = plainToInstance(account, {
        ...dto,
      });

      const is_existed = await this.accRepository.findOneByCondition({
        email: dto.email,
      });

      if (is_existed) {
        Sentry.captureException(
          `[Account-Service:=>:create] Account creation failed - Email ${dto.email} already exists`,
        );
        throw new HttpException(
          { details: 'Account with the same email is already existed.' },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.mailer.sendMail(
        new_account.email,
        "Welcome to Evntaly - Let's Get Started!",
        '',
        'welcome',
        {
          email:
            new_account.account_owner_name || new_account.email.split('@')[0],
        },
        true,
      );

      return await this.addPlanToAccount(new_account);
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:create] Error creating account: ${error.message}`,
      );
      throw error;
    }
  }

  async createWithGithub(code: string, req: any): Promise<any> {
    try {
      const data = await this.githubauth.getGithubAccountInfo(code);
      if (data) {
        const new_account = plainToInstance(githubAuthAccountDTO, {
          email: data.email,
          account_owner_name: data.login,
          company_name: data.company,
          location: data.location,
          github_username: data.login,
          github_id: data.id.toString(),
          auth_provider: 'github',
        });

        const errors = await validate(new_account);
        if (errors.length > 0) {
          this.logger.error(
            'Github Account Creation Failed - Invalid inputs -> ',
            errors,
          );
          throw new HttpException(
            {
              message:
                'Create Account With Github Failed - Invalid inputs, check error fields you entered.',
              errors: errors,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const is_existed = await this.accRepository.findOneByCondition({
          github_id: new_account.github_id,
        });

        // If the account is existed, return the account details
        if (is_existed) {
          const token = this.generateJWT(is_existed);
          const refreshToken = this.generateRefreshToken(is_existed);

          return {
            token: token,
            refreshToken: refreshToken,
            tenantID: is_existed.tenantID,
            email: is_existed.email,
            name: is_existed.account_owner_name,
            developer_secret: is_existed.developer_secret,
            projects: is_existed.projects,
            plan: is_existed.planID,
            licenseStatus: is_existed.license_status,
            referal_code: is_existed.referal_code,
            team_size: is_existed.team_size,
            company: is_existed.company_name,
            progress: is_existed.progress,
          };
        }

        // If the email is already in use, it means that the account is already created before
        const is_account_created_before =
          await this.accRepository.findOneByCondition({
            email: new_account.email,
          });

        if (is_account_created_before) {
          Sentry.captureException(
            `[Account-Service:=>:createWithGithub] GitHub account creation failed - Email ${new_account.email} exists`,
          );
          throw new HttpException(
            '[oauth_email_exists] Email is already existed',
            HttpStatus.BAD_REQUEST,
          );
        }

        // If the account is not created before, create the account
        const result = await this.addPlanToAccount(new_account);

        await this.mailer.sendMail(
          new_account.email,
          "Welcome to Evntaly - Let's Get Started!",
          '',
          'welcome',
          {
            email:
              new_account.account_owner_name || new_account.email.split('@')[0],
          },
          true,
        );

        return result;
      }
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:createWithGithub] Error creating GitHub account: ${error.message}`,
      );
      return {
        message: error.message,
        error: error.message,
      };
    }
  }

  async createWithGoogle(code: string, req: any): Promise<any> {
    try {
      const data = await this.googleauth.getGoogleAccountInfo(code);
      if (data) {
        const new_account = plainToInstance(googleAuthAccountDTO, {
          email: data.email,
          account_owner_name: data.name,
          company_name: '',
          location: '',
          google_sub: data.sub,
          auth_provider: 'google',
        });

        const errors = await validate(new_account);
        if (errors.length > 0) {
          this.logger.error(
            'Google Account Creation Failed - Invalid inputs -> ',
            errors,
          );
          throw new HttpException(
            {
              message:
                'Create Account With Google Failed - Invalid inputs, check error fields you entered.',
              errors: errors,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const is_existed = await this.accRepository.findOneByCondition({
          google_sub: new_account.google_sub,
        });

        if (is_existed) {
          const token = this.generateJWT(is_existed);
          const refreshToken = this.generateRefreshToken(is_existed);

          return {
            token: token,
            refreshToken: refreshToken,
            tenantID: is_existed.tenantID,
            email: is_existed.email,
            name: is_existed.account_owner_name,
            developer_secret: is_existed.developer_secret,
            projects: is_existed.projects,
            plan: is_existed.planID,
            licenseStatus: is_existed.license_status,
            referal_code: is_existed.referal_code,
            team_size: is_existed.team_size,
            company: is_existed.company_name,
            progress: is_existed.progress,
          };
        }

        const is_account_created_before =
          await this.accRepository.findOneByCondition({
            email: new_account.email,
          });

        if (is_account_created_before) {
          Sentry.captureException(
            `[Account-Service:=>:createWithGoogle] Google account creation failed - Email ${new_account.email} exists`,
          );
          throw new HttpException(
            '[oauth_email_exists] Email is already existed',
            HttpStatus.BAD_REQUEST,
          );
        }

        // If the account is not created before, create the account
        const result = await this.addPlanToAccount(new_account);

        await this.mailer.sendMail(
          new_account.email,
          "Welcome to Evntaly - Let's Get Started!",
          '',
          'welcome',
          {
            email:
              new_account.account_owner_name || new_account.email.split('@')[0],
          },
          true,
        );

        return result;
      }
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:createWithGoogle] Error creating Google account: ${error.message}`,
      );
      return {
        message: error.message,
        error: error.message,
      };
    }
  }

  async login(dto: authAccountDTO) {
    try {
      const account = await this.accRepository.findOneByCondition({
        email: dto.email,
      });

      if (account.auth_provider !== 'password') {
        Sentry.captureException(
          `[Account-Service:=>:login] Login failed - Invalid credentials for email ${dto.email}`,
        );
        throw new HttpException(
          {
            message:
              'This account is not allowed to sign in with password. Please use other authentication method.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!account || !(await bcrypt.compare(dto.password, account.password))) {
        Sentry.captureException(
          `[Account-Service:=>:login] Login failed - Invalid credentials for email ${dto.email}`,
        );
        throw new HttpException(
          {
            message:
              "Hmm… we couldn't log you in. Please check your email and password.",
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Update last login date
      await this.accRepository.updateOneByCondition(
        { email: dto.email },
        { $set: { last_login_date: new Date() } },
      );

      const token = this.generateJWT(account);
      const refreshToken = this.generateRefreshToken(account);

      return {
        token: token,
        refreshToken: refreshToken,
        tenantID: account.tenantID,
        email: account.email,
        name: account.account_owner_name,
        developer_secret: account.developer_secret,
        projects: account.projects,
        plan: account.planID,
        licenseStatus: account.license_status,
        referal_code: account.referal_code,
        team_size: account.team_size,
        company: account.company_name,
        timezone: account.timezone,
        progress: account.progress,
        last_login_date: account.last_login_date,
      };
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:login] Error during login: ${error.message}`,
      );
      throw error;
    }
  }

  async detailsByTenantID(tenantID: string) {
    try {
      const account = await this.accRepository.findOneByCondition({
        tenantID: tenantID,
      });
      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:detailsByTenantID] Account not found for tenant ${tenantID}`,
        );
      }
      return account;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:detailsByTenantID] Error fetching account details: ${error.message}`,
      );
      throw error;
    }
  }

  async detailsByDeveloperSecret(secret: string) {
    try {
      const account = await this.accRepository.findOneByCondition({
        developer_secret: secret,
      });
      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:detailsByDeveloperSecret] Account not found for developer secret`,
        );
      }
      return account;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:detailsByDeveloperSecret] Error fetching account by developer secret: ${error.message}`,
      );
      throw error;
    }
  }

  async validatePAT(pat: string) {
    try {
      const project_account = await this.accRepository.findOneByCondition({
        projects: {
          $elemMatch: {
            tokens: { $in: [pat] },
          },
        },
      });

      if (project_account) {
        const project = project_account.projects.find((proj) =>
          proj.tokens.includes(pat),
        );

        if (project) {
          return { is_valid: true, projectID: project.projectID };
        }
      }

      Sentry.captureException(
        `[Account-Service:=>:validatePAT] Invalid PAT token provided`,
      );
      return { is_valid: false };
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:validatePAT] Error validating PAT: ${error.message}`,
      );
      throw error;
    }
  }

  async update(updated_entity: account) {
    try {
      return await this.accRepository.update(
        updated_entity['_id'],
        updated_entity,
      );
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:update] Error updating account: ${error.message}`,
      );
      throw error;
    }
  }

  async list_all_accounts() {
    try {
      const accounts = await this.accRepository.findAllByCondition({});
      return accounts;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:list_all_accounts] Error listing all accounts: ${error.message}`,
      );
      throw error;
    }
  }

  async check_account_quota(developer_secret: any) {
    try {
      const account = await this.accRepository.findOneByCondition({
        developer_secret,
        $expr: {
          $gt: ['$details.monthly_consumed_events', '$details.monthly_events'],
        },
      });
      if (account) {
        Sentry.captureException(
          `[Account-Service:=>:check_account_quota] Account quota exceeded for developer secret`,
        );
      }
      return account;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:check_account_quota] Error checking account quota: ${error.message}`,
      );
      throw error;
    }
  }

  async update_account_quota(query: any, value: any) {
    try {
      const update = {
        $inc: { ['details.monthly_consumed_events']: value },
        $set: { updatedAt: new Date() },
      };

      return await this.accRepository.updateOneByCondition(query, update);
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:update_account_quota] Error updating account quota: ${error.message}`,
      );
      throw error;
    }
  }

  async create_project(dto: createProjectDTO) {
    try {
      const account = await this.detailsByTenantID(dto.tenantID);

      if (!account) {
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      const current_projects = account.projects || [];
      if (current_projects.length >= 3) {
        Sentry.captureException(
          `[Account-Service:=>:create_project] Project creation failed - Maximum limit reached for tenant ${dto.tenantID}`,
        );
        throw new HttpException(
          'Cannot create project. Maximum of 3 projects already reached..',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newProject = {
        name: dto.name,
        projectID: crypto.randomBytes(4).toString('hex'),
        tokens: [crypto.randomBytes(16).toString('hex')],
      };

      current_projects.push(newProject);

      await this.accRepository.updateOneByCondition(
        { tenantID: dto.tenantID },
        { $set: { projects: current_projects } },
      );

      return current_projects;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:create_project] Error creating project: ${error.message}`,
      );
      throw error;
    }
  }

  async delete_project(tenantID: string, projectID: string) {
    try {
      const account = await this.detailsByTenantID(tenantID);

      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:delete_project] Account not found for tenant ${tenantID}`,
        );
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      const current_projects = account.projects || [];

      if (current_projects.length === 1) {
        Sentry.captureException(
          `[Account-Service:=>:delete_project] Cannot delete last project for tenant ${tenantID}`,
        );
        throw new HttpException(
          'Cannot delete project. Minimum of 1 project should be available.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const projectIndex = current_projects.findIndex(
        (project) => project.projectID === projectID,
      );

      if (projectIndex === -1) {
        Sentry.captureException(
          `[Account-Service:=>:delete_project] Project not found - ProjectID ${projectID} for tenant ${tenantID}`,
        );
        throw new HttpException('Project not found.', HttpStatus.BAD_REQUEST);
      }

      current_projects.splice(projectIndex, 1);

      await this.accRepository.updateOneByCondition(
        { tenantID },
        { $set: { projects: current_projects } },
      );

      return {
        message: 'Project deleted successfully.',
        projects: current_projects,
      };
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:delete_project] Error deleting project: ${error.message}`,
      );
      throw error;
    }
  }

  async update_project_name(
    tenantID: string,
    projectID: string,
    new_name: string,
  ) {
    try {
      const account = await this.detailsByTenantID(tenantID);

      if (!account) {
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      const project = account.projects?.find(
        (proj) => proj.projectID === projectID,
      );

      if (!project) {
        Sentry.captureException(
          `[Account-Service:=>:update_project_name] Project not found - ProjectID ${projectID} for tenant ${tenantID}`,
        );
        throw new HttpException('Project not found.', HttpStatus.BAD_REQUEST);
      }

      project.name = new_name;

      await this.accRepository.updateOneByCondition(
        { tenantID: tenantID },
        { $set: { projects: account.projects } },
      );

      return project;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:update_project_name] Error updating project name: ${error.message}`,
      );
      throw error;
    }
  }

  async add_token_to_project(tenantID: string, projectID: string) {
    try {
      const account = await this.detailsByTenantID(tenantID);
      if (!account) {
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      const project = account.projects?.find(
        (proj) => proj.projectID === projectID,
      );

      if (!project) {
        Sentry.captureException(
          `[Account-Service:=>:add_token_to_project] Project not found - ProjectID ${projectID} for tenant ${tenantID}`,
        );
        throw new HttpException('Project not found.', HttpStatus.BAD_REQUEST);
      }

      const new_token = crypto.randomBytes(16).toString('hex');
      project.tokens = [...(project.tokens || []), new_token];

      await this.accRepository.updateOneByCondition(
        { tenantID },
        { $set: { projects: account.projects } },
      );

      return new_token;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:add_token_to_project] Error adding token to project: ${error.message}`,
      );
      throw error;
    }
  }

  async list_projects(tenantID: string) {
    try {
      const account = await this.detailsByTenantID(tenantID);

      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:list_projects] Account not found for tenant ${tenantID}`,
        );
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      const projects = account.projects || [];
      return projects;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:list_projects] Error listing projects: ${error.message}`,
      );
      throw error;
    }
  }

  async get_all_tokens(tenantID: string) {
    try {
      const account = await this.detailsByTenantID(tenantID);

      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:get_all_tokens] Account not found for tenant ${tenantID}`,
        );
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      const projects = account.projects || [];

      const tokens = projects.flatMap((project) =>
        project.tokens.map((token) => ({
          token,
          projectName: project.name,
          projectID: project.projectID,
        })),
      );

      return tokens;
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:get_all_tokens] Error getting all tokens: ${error.message}`,
      );
      throw error;
    }
  }

  async delete_token_from_project(
    tenantID: string,
    projectID: string,
    token: string,
  ) {
    try {
      const account = await this.detailsByTenantID(tenantID);

      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:delete_token_from_project] Account not found for tenant ${tenantID}`,
        );
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      const current_projects = account.projects || [];
      const project = current_projects.find((p) => p.projectID === projectID);

      if (!project) {
        Sentry.captureException(
          `[Account-Service:=>:delete_token_from_project] Project not found - ProjectID ${projectID} for tenant ${tenantID}`,
        );
        throw new HttpException('Project not found.', HttpStatus.BAD_REQUEST);
      }

      const tokenIndex = project.tokens.indexOf(token);
      if (tokenIndex === -1) {
        Sentry.captureException(
          `[Account-Service:=>:delete_token_from_project] Token not found in project ${projectID}`,
        );
        throw new HttpException(
          'Token not found in the specified project.',
          HttpStatus.BAD_REQUEST,
        );
      }

      project.tokens.splice(tokenIndex, 1);

      await this.accRepository.updateOneByCondition(
        { tenantID },
        { $set: { projects: current_projects } },
      );

      return {
        message: 'Token deleted successfully.',
        project: {
          projectID: project.projectID,
          name: project.name,
          tokens: project.tokens,
        },
      };
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:delete_token_from_project] Error deleting token from project: ${error.message}`,
      );
      throw error;
    }
  }

  async get_account_plan_details(tenantID: string) {
    try {
      const account = await this.detailsByTenantID(tenantID);

      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:get_account_plan_details] Account not found for tenant ${tenantID}`,
        );
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      return {
        planID: account.planID,
        price: 0,
        licenseStatus: account.license_status,
        licenseExpirationDate: account.license_expiration_date,
        isBusinessAccount: account.is_business_account,
        details: account.details,
      };
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:get_account_plan_details] Error getting account plan details: ${error.message}`,
      );
      throw error;
    }
  }

  async get_account_details(tenantID: string) {
    try {
      const account = await this.detailsByTenantID(tenantID);

      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:get_account_details] Account not found for tenant ${tenantID}`,
        );
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      return {
        tenantID: account.tenantID,
        email: account.email,
        name: account.account_owner_name,
        developer_secret: account.developer_secret,
        projects: account.projects,
        plan: account.planID,
        licenseStatus: account.license_status,
        referal_code: account.referal_code,
        team_size: account.team_size,
        company: account.company_name,
        location: account.location,
        timezone: account.timezone,
        progress: account.progress,
        extras: account.extras,
      };
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:get_account_details] Error getting account details: ${error.message}`,
      );
      throw error;
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const account = await this.accRepository.findOneByCondition({
        email: email,
      });

      if (!account) {
        Sentry.captureException(
          `[Account-Service:=>:requestPasswordReset] Password reset failed - Account not found for email ${email}`,
        );
        throw new HttpException(
          'Account for this email is not found.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (account.auth_provider !== 'password') {
        Sentry.captureException(
          `[Account-Service:=>:requestPasswordReset] Password reset failed - Invalid auth provider ${account.auth_provider} for email ${email}`,
        );
        throw new HttpException(
          'Password reset is not available for this account.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      account.reset_token = resetToken;
      account.reset_token_expiry = resetTokenExpiry;
      await this.update(account);

      await this.mailer.sendMail(
        account.email,
        'Reset Your Password – Action Required',
        '',
        'password-reset',
        {
          email: account.account_owner_name || account.email.split('@')[0],
          resetLink: `${process.env.CLIENT_URL}/account/reset-password/${resetToken}`,
        },
        true,
      );

      return { message: 'Reset instructions sent to email' };
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:requestPasswordReset] Error requesting password reset: ${error.message}`,
      );
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const account = await this.accRepository.findOneByCondition({
      reset_token: token,
    });

    if (
      !account ||
      !account.reset_token ||
      account.reset_token_expiry < new Date()
    ) {
      throw new HttpException(
        'Invalid or expired link token, request reseting your password again.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Fix: Add salt rounds parameter to bcrypt.hash
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    account.password = hashedPassword;
    account.reset_token = null;
    account.reset_token_expiry = null;

    await this.accRepository.update(account['_id'], account);

    return { message: 'Password successfully reset' };
  }

  async checkUserLimits(secret: string) {
    try {
      this.logger.error(`Checking user limits for developer secret ${secret}`);
      const account = await this.accRepository.findOneByCondition({
        developer_secret: secret,
      });

      if (!account) {
        throw new HttpException('Account not found.', HttpStatus.BAD_REQUEST);
      }

      const { monthly_consumed_events, monthly_events } = account.details;

      if (monthly_consumed_events >= monthly_events) {
        Sentry.captureException(
          `[Account-Service:=>:checkUserLimits] User limit reached for tenant ${account.tenantID}`,
        );
        return { limitReached: true };
      }

      return { limitReached: false };
    } catch (error) {
      Sentry.captureException(
        `[Account-Service:=>:checkUserLimits] Error checking user limits: ${error.message}`,
      );
      throw error;
    }
  }

  //#region Helper Methods..
  private generateJWT(account: account) {
    const today = new Date();
    const exp = new Date(today);
    exp.setFullYear(today.getFullYear() + 1);

    return jwt.sign(
      {
        tenantID: account.tenantID,
        email: account.email,
        exp: Math.floor(exp.getTime() / 1000),
      },
      'SECRET_KEYS',
    );
  }

  private generateRefreshToken(account: account) {
    const today = new Date();
    const exp = new Date(today);
    exp.setFullYear(today.getFullYear() + 1);
    return jwt.sign(
      {
        tenantID: account.tenantID,
        email: account.email,
        exp: Math.floor(exp.getTime() / 1000),
        type: 'refresh',
      },
      'REFRESH_SECRET_KEY',
    );
  }

  private async addPlanToAccount(new_account: any) {
    new_account.planID = 'starter';

    new_account.details = {
      monthly_consumed_events: 0,
      monthly_events: 2500,
      consumed_useres: 0,
      users: 300,
      sessions_details: false,
      useres_details: true,
      features_details: true,
      custom_analytics: false,
      integrations: true,
      hands_free_weekly_reports: false,
      hands_free_monthly_reports: false,
      dedicated_support: false,
      feature_requests: false,
      isolated_env: false,
    };

    const instance = plainToInstance(account, new_account);

    const saved = await this.accRepository.create(instance);
    return {
      email: saved.toJSON().email,
      name: saved.toJSON().account_owner_name,
      token: this.generateJWT(saved.toJSON()),
      refreshToken: this.generateRefreshToken(saved.toJSON()),
      developer_secret: saved.toJSON().developer_secret,
      projects: saved.toJSON().projects,
      plan: saved.toJSON().planID,
      licenseStatus: saved.toJSON().license_status,
      team_size: saved.toJSON().team_size,
      company: saved.toJSON().company_name,
      timezone: saved.toJSON().timezone,
      progress: saved.toJSON().progress,
      tenantID: saved.toJSON().tenantID,
    };
  }
  //#endregion
}
