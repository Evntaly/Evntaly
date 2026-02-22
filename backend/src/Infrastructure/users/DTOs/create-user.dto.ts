import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class createUserDTO {
  tenantID: string;
  projectID: string;

  @IsNotEmpty()
  @IsString()
  id?: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  organization?: string;

  @IsObject()
  data: any;
}
