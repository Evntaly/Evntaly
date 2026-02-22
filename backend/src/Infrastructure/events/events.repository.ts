import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { events } from 'src/@domain';
import { Repository } from '../base.repository';

export class eventsRepository extends Repository<events> {
  constructor(@InjectModel(events.name) readonly repo_model: Model<events>) {
    super(repo_model);
  }
}
