import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';

export type SessionsOccurancessDocument = Document & sessionsOccurances;

@Schema({ collection: 'sessions_occurances' })
export class sessionsOccurances extends baseModel {
  @Prop({ required: true })
  composite_ID: string; //tenantid-parentid-sessionid

  @Prop({ required: true })
  tenantID: string;

  @Prop({ required: true })
  projectID: string;

  @Prop({ required: true })
  parentEventID?: string;

  @Prop({ required: true })
  sessionID?: string;

  @Prop({ required: false, default: 1 })
  occurances_count?: number;
}
export const SessionsOccurancessSchema =
  SchemaFactory.createForClass(sessionsOccurances);
