import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';

export type LookupsDocument = Document & lookups;

@Schema({ collection: 'lookups' })
export class lookups extends baseModel {
  @Prop({ required: true })
  data: [object];

  @Prop({ required: true })
  key?: string;
}
export const LookupsSchema = SchemaFactory.createForClass(lookups);
