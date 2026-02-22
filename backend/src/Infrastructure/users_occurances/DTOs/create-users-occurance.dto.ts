import { IsNotEmpty, IsString } from 'class-validator';

export class createUsersOccuranceDTO {
  @IsNotEmpty()
  @IsString()
  tenantID: string;

  @IsNotEmpty()
  @IsString()
  projectID: string;

  @IsNotEmpty()
  @IsString()
  parentEventID: string;

  @IsNotEmpty()
  @IsString()
  userID: string;
}
