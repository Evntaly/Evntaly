import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FunnelDocument = funnel & Document;

@Schema()
export class funnel {
  @Prop({ required: true })
  tenantID: string;

  @Prop({ required: true })
  projectID?: string;

  @Prop({ required: true })
  funnel_name: string;

  @Prop({ type: Array, required: true })
  steps: {
    event_name: string;
    step_order: number;
  }[];

  @Prop({ default: 'active' })
  status: string;

  @Prop({ type: Object })
  metadata: {
    description?: string;
    tags?: string[];
    created_by?: string;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const FunnelSchema = SchemaFactory.createForClass(funnel);
