import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';

export type UsersOccurancessDocument = Document & usersOccurances;

@Schema({ collection: 'users_occurances' })
export class usersOccurances extends baseModel {
  @Prop({ required: true })
  composite_ID: string; //tenantid-parentid-user-id

  @Prop({ required: true })
  tenantID: string;

  @Prop({ required: true })
  projectID: string;

  @Prop({ required: true })
  parentEventID?: string;

  @Prop({ required: true })
  userID?: string;

  @Prop({ required: false, default: 1 })
  occurances_count?: number;
}
export const UsersOccurancessSchema =
  SchemaFactory.createForClass(usersOccurances);
