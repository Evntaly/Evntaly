import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';
import { licenseStatuses } from 'src/@core/helpers';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Type } from 'class-transformer';

export type AccountDocument = Document & account;

export class project {
  projectID?: string;
  name?: string;
  tokens?: string[];
}

export class progressStatus {
  is_activated?: boolean = false;
  is_onboarded?: boolean = false;
  is_integrated?: boolean = false;
  is_business?: boolean = false;
  is_on_paid?: boolean = false;
  is_on_free?: boolean = false;
}

export class zapierSettings {
  target_url?: string;
}

export class extras {
  ZAPIER_SETTINGS?: zapierSettings;
}

export class licenseDetails {
  monthly_consumed_events?: number = 0;
  monthly_events?: number = 1000;
  consumed_useres?: number = 0;
  users?: number = 300;
  sessions_details?: boolean = false;
  useres_details?: boolean = true;
  features_details?: boolean = true;
  custom_analytics?: boolean = false;
  integrations?: boolean = true;
  hands_free_weekly_reports?: boolean = false;
  hands_free_monthly_reports?: boolean = false;
  dedicated_support?: boolean = false;
  feature_requests?: boolean = false;
  isolated_env?: boolean = false;
}

@Schema({ collection: 'accounts' })
export class account extends baseModel {
  @Prop({ default: '' })
  tenantID?: string;

  @Prop({ required: true, default: 'starter' })
  planID?: string;

  @Prop({
    required: function () {
      return this.authProvider === 'password';
    },
  })
  email: string;

  @Prop({ required: false, default: '' })
  password?: string;

  @Prop({ required: false, default: 'password' })
  auth_provider?: string;

  @Prop({ required: false })
  github_username?: string;

  @Prop({ required: false })
  github_id?: string;

  @Prop({ required: false })
  google_sub?: string;

  @Prop({ required: false })
  account_owner_name?: string;

  @Prop({ required: false })
  company_name?: string;

  @Prop({ required: false, default: false })
  is_business_account?: boolean;

  @Prop({ required: false, default: false })
  is_deleted?: boolean;

  @Prop({ required: false, default: false })
  is_locked?: boolean;

  @Prop({ required: false })
  developer_secret?: string;

  @Prop({
    required: true,
    enum: licenseStatuses,
    default: licenseStatuses.ACTIVE,
  })
  license_status?: string;

  @Prop({ required: false })
  license_expiration_date?: Date;

  @Prop({ required: false, default: '' })
  referal_code?: string;

  @Prop({ required: false, default: '' })
  refered_by?: string;

  @Prop({ required: false })
  job_title?: string;

  @Prop({ required: false, enum: ['Production', 'Development'] })
  project_status?: string;

  @Prop({ required: false })
  team_size?: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ required: false })
  phone_number?: string;

  @Prop({ required: false, default: 'Africa/Cairo' })
  timezone?: string;

  @Prop({ required: false })
  company_size?: string;

  @Prop({ required: false })
  @Type(() => licenseDetails)
  details?: licenseDetails;

  @Prop({ required: false })
  projects?: project[];

  @Prop({ required: false })
  progress?: progressStatus;

  @Prop({ required: false })
  reset_token?: string;

  @Prop({ required: false })
  reset_token_expiry?: Date;

  @Prop({ required: false })
  last_login_date?: Date;

  @Prop({ required: false, default: {} })
  extras?: extras;

}

export const AccountsSchema = SchemaFactory.createForClass(account);

AccountsSchema.pre('save', async function (next) {
  if (this.auth_provider == 'password') {
    this.password = await bcrypt.hash(this.password, 12);
    const name_segment = this.email.split('@')[0];
    this.account_owner_name = `${name_segment}${crypto.randomBytes(5).toString('hex')}`;

    const regular_emails = [
      'gmail.com',
      'hotmail.com',
      'outlook.com',
      'yahoo.com',
    ];
    this.is_business_account = !regular_emails.includes(
      this.email.split('@')[1]!.toLocaleLowerCase(),
    );
  }

  this.tenantID = crypto.randomBytes(16).toString('hex');
  this.developer_secret = crypto.randomBytes(8).toString('hex');
  this.referal_code = Math.random().toString(36).substring(2, 10);

  this.license_expiration_date = moment().add(1, 'month').toDate();

  this.progress = {
    is_business: this.is_business_account,
    is_on_free: true,
    is_on_paid: false,
    is_integrated: false,
    is_onboarded: false,
  };

  this.projects.push({
    projectID: crypto.randomBytes(4).toString('hex'),
    name: 'Default',
    tokens: [crypto.randomBytes(14).toString('hex')],
  });

  next();
});
