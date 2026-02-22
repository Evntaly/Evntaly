import { IsNotEmpty, IsString } from 'class-validator';

export class createEventOccuranceDTO {
  @IsNotEmpty()
  @IsString()
  projectID: string;

  @IsNotEmpty()
  @IsString()
  tenantID: string;

  @IsNotEmpty()
  @IsString()
  title: string;
}
