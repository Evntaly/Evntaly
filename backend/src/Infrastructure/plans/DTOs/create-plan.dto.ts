import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class createPlanDTO {
  @IsString()
  planID: string;

  @IsString()
  name: string;

  @IsNumber()
  monthly_events: number = 2500;

  @IsNumber()
  users: number = 1;

  @IsBoolean()
  sessions_details: boolean = false;

  @IsBoolean()
  useres_details: boolean = true;

  @IsBoolean()
  features_details: boolean = true;

  @IsBoolean()
  custom_analytics: boolean = false;

  @IsBoolean()
  integrations: boolean = true;

  @IsBoolean()
  hands_free_weekly_reports: boolean = false;

  @IsBoolean()
  hands_free_monthly_reports: boolean = false;

  @IsBoolean()
  dedicated_support: boolean = false;

  @IsBoolean()
  feature_requests: boolean = false;

  @IsBoolean()
  isolated_env: boolean = false;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsNumber()
  view_order: number;

  @IsNumber()
  price: number;
}
