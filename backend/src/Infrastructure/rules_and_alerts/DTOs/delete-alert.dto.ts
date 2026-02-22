import { IsNotEmpty, IsString } from 'class-validator';

export class deleteAlertDTO {
  tenantID: string;
  projectID: string;

  @IsNotEmpty()
  parentEventID: string;

  @IsNotEmpty()
  @IsString()
  alertID: string;
}
