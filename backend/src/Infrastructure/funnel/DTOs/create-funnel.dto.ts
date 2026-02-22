import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FunnelStepDto {
  // @IsString()
  // step_name: string;

  @IsString()
  event_name: string;

  @IsNumber()
  step_order: number;

  // @IsOptional()
  // conditions?: Record<string, any>;
}

class FunnelMetadataDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  created_by?: string;
}

export class createFunnelDto {
  @IsString()
  @IsOptional()
  tenantID: string;

  @IsString()
  @IsOptional()
  projectID?: string;

  @IsString()
  funnel_name: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FunnelStepDto)
  steps: FunnelStepDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FunnelMetadataDto)
  metadata?: FunnelMetadataDto;
}
