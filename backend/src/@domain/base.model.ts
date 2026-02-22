import { AutoMap } from '@automapper/classes';
import { Prop } from '@nestjs/mongoose';

export class baseModel {
  @AutoMap()
  @Prop({ default: Date.now, required: false })
  createdAt?: Date;

  @AutoMap()
  @Prop({ default: null, required: false })
  updatedAt?: Date;

  @AutoMap()
  @Prop({ required: false })
  createdBy?: string;

  @AutoMap()
  @Prop({ required: false })
  updatedBy?: string;
}
