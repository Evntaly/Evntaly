import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class AlarmConfigurations {
  send_alarm_on: string;
  webhook_url?: string;
}

export class createAlertDTO {
  tenantID: string;
  projectID: string;

  @IsNotEmpty()
  @IsOptional()
  parentEventID: string;

  @IsNotEmpty()
  @IsOptional()
  userID: string;

  @IsNotEmpty()
  @IsNumber()
  occurances: number;

  @IsNotEmpty()
  @IsString()
  period?: string;

  @IsNotEmpty()
  @IsString()
  integrationID?: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AlarmConfigurations)
  alarm_configurations: AlarmConfigurations;
}
