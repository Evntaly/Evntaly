import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { alerts } from 'src/@domain';
import { Repository } from '../base.repository';

export class alertsRepository extends Repository<alerts> {
  constructor(@InjectModel(alerts.name) readonly repo_model: Model<alerts>) {
    super(repo_model);
  }
}
