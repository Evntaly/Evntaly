import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';

export type EventsOccurancessDocument = Document & eventOccurances;

@Schema({ collection: 'events_occurances' })
export class eventOccurances extends baseModel {
  @Prop({ required: true })
  tenantID: string;

  @Prop({ required: true })
  projectID: string;

  @Prop({ required: true })
  parentEventID?: string;

  @Prop({ required: true })
  title?: string;

  @Prop({ required: false, default: '' })
  alert?: string;

  @Prop({ required: false, default: 1 })
  occurances_count?: number;

  @Prop({ required: false, default: false })
  is_key_event?: boolean; // Key event is an activation event

  @Prop({ required: false, default: 0 })
  key_event_order?: number;
}
export const EventOccurancessSchema =
  SchemaFactory.createForClass(eventOccurances);
