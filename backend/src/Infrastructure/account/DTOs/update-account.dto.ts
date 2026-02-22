import { IsOptional, IsString } from 'class-validator';

export class updateAccountDTO {
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  team_size: string;

  @IsOptional()
  @IsString()
  project_status: string;

  @IsOptional()
  @IsString()
  location?: string;
}
