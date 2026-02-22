import { IsString } from 'class-validator';

export class createProjectDTO {
  tenantID: string;

  @IsString()
  name: string;
}
