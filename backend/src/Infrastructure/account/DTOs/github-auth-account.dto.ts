import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class githubAuthAccountDTO {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  account_owner_name?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  github_username?: string;

  @IsOptional()
  @IsString()
  github_id?: string;

  @IsOptional()
  @IsString()
  auth_provider?: string;
}
