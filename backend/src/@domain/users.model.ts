import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';

export type UsersDocument = Document & users;

@Schema({ collection: 'users' })
export class users extends baseModel {
  @Prop({ required: true })
  tenantID: string;

  @Prop({ required: true })
  projectID: string;

  @Prop({ required: true })
  id?: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  full_name?: string;

  @Prop({ required: false })
  organization?: string;

  @Prop({ required: false, default: {}, type: {} })
  data?: any;

  @Prop({ required: false, default: '' })
  alert?: string;
}

export const UsersSchema = SchemaFactory.createForClass(users);

UsersSchema.index({ tenantID: 1, id: 1, projectID: 1 }, { unique: true });
