import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';

export type FeaturesOccurancessDocument = Document & featuresOccurances;

@Schema({ collection: 'features_occurances' })
export class featuresOccurances extends baseModel {
  @Prop({ required: true })
  composite_ID: string; //tenantid-parentid-feature-name

  @Prop({ required: true })
  tenantID: string;

  @Prop({ required: true })
  projectID: string;

  @Prop({ required: true })
  parentEventID?: string;

  @Prop({ required: true })
  feature?: string;

  @Prop({ required: false, default: 1 })
  occurances_count?: number;
}
export const FeaturesOccurancessSchema =
  SchemaFactory.createForClass(featuresOccurances);
