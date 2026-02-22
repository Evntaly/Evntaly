import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';

export type IntegrationsDocument = Document & integrations;

@Schema({ collection: 'integrations' })
export class integrations extends baseModel {
  @Prop({ required: true })
  tenantID: string;

  @Prop({ required: true })
  projectID?: string;

  @Prop({ required: true })
  name?: string;

  @Prop({ required: true })
  status?: string;

  @Prop({ required: true, type: {} })
  configurations?: any;
}

export const IntegrationsSchema = SchemaFactory.createForClass(integrations);

IntegrationsSchema.index(
  { tenantID: 1, name: 1, projectID: 1 },
  { unique: true },
);
