import { IsNotEmpty, IsString } from 'class-validator';

export class createSessionsOccuranceDTO {
  @IsNotEmpty()
  @IsString()
  projectID: string;

  @IsNotEmpty()
  @IsString()
  tenantID: string;

  @IsNotEmpty()
  @IsString()
  parentEventID: string;

  @IsNotEmpty()
  @IsString()
  sessionID: string;
}
