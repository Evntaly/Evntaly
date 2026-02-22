import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class authAccountDTO {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
