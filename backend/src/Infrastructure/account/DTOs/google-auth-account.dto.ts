import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class googleAuthAccountDTO {
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

  @IsString()
  google_sub?: string;

  @IsString()
  auth_provider?: string;
}
