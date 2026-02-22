import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { funnel } from 'src/@domain/funnel.model';
import { Repository } from '../base.repository';

@Injectable()
export class funnelRepository extends Repository<funnel> {
  constructor(
    @InjectModel(funnel.name)
    private readonly funnelModel: Model<funnel>,
  ) {
    super(funnelModel);
  }
}
