import { IsNotEmpty, IsObject } from 'class-validator';

export class createIntegrationsDTO {
  tenantID: string;
  projectID: string;

  @IsNotEmpty()
  name?: string;

  @IsNotEmpty()
  @IsObject()
  configurations?: any;
}
