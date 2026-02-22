import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lookups } from 'src/@domain';
import { Repository } from '../base.repository';

export class lookupsRepository extends Repository<lookups> {
  constructor(@InjectModel(lookups.name) readonly repo_model: Model<lookups>) {
    super(repo_model);
  }
}
