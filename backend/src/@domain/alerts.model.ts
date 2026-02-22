import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';

class AlarmConfigurations {
  send_alarm_on: string;
  webhook_url?: string;
}

export type AlertsDocument = Document & alerts;

@Schema({ collection: 'alerts' })
export class alerts extends baseModel {
  @Prop({ required: true })
  tenantID: string;

  @Prop({ required: true })
  projectID?: string;

  @Prop({ required: false })
  parentEventID?: string;

  @Prop({ required: false })
  userID?: string;

  @Prop({ required: true })
  occurances?: number;

  @Prop({ required: true })
  period?: string;

  @Prop({ required: true })
  period_start?: Date;

  @Prop({ required: true })
  period_end?: Date;

  @Prop({ required: true, default: 0 })
  current_count?: number;

  @Prop({ required: true, default: '' })
  integrationID?: string;

  @Prop({ required: true })
  alarm_configurations?: AlarmConfigurations;
}

export const AlertsSchema = SchemaFactory.createForClass(alerts);
