import { IsOptional, IsString } from 'class-validator';

export class updateAccountSettingsDTO {
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  team_size: string;

  @IsOptional()
  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  account_owner_name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
