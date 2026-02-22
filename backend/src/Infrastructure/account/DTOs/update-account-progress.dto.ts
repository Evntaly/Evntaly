import { IsBoolean, IsOptional } from 'class-validator';

export class updateAccountProgressDTO {
  @IsOptional()
  @IsBoolean()
  is_activated?: boolean;

  @IsOptional()
  @IsBoolean()
  is_onboarded?: boolean;

  @IsOptional()
  @IsBoolean()
  is_integrated?: boolean;

  @IsOptional()
  @IsBoolean()
  is_business?: boolean;

  @IsOptional()
  @IsBoolean()
  is_on_paid?: boolean;

  @IsOptional()
  @IsBoolean()
  is_on_free?: boolean;
}
