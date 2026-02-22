import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { eventOccurances } from 'src/@domain';
import { Repository } from '../base.repository';

export class eventOccurancesRepository extends Repository<eventOccurances> {
  constructor(
    @InjectModel(eventOccurances.name)
    readonly repo_model: Model<eventOccurances>,
  ) {
    super(repo_model);
  }
}
