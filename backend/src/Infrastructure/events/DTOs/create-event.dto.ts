import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class createEventDTO {
  tenantID: string;
  projectID: string;

  @IsNotEmpty()
  @IsOptional()
  parentEventID: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  sessionID?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Event title must be at least 5 characters long.' })
  @MaxLength(500, { message: 'Event title cannot exceed 25 characters.' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Event title must be at least 5 characters long.' })
  @MaxLength(500, { message: 'Event title cannot exceed 25 characters.' })
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsObject()
  data: any;

  @IsArray()
  @IsOptional()
  tags?: [string];

  @IsOptional()
  notify?: boolean;

  @IsOptional()
  apply_rule_only?: boolean;

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  user?: any;

  @IsString()
  @IsOptional()
  feature?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsObject()
  @IsOptional()
  context?: any;

  @IsObject()
  @IsOptional()
  requestContext?: any;
}
