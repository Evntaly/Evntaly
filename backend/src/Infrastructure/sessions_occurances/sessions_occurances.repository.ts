import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sessionsOccurances } from 'src/@domain';
import { Repository } from '../base.repository';

export class sessionsOccurancesRepository extends Repository<sessionsOccurances> {
  constructor(
    @InjectModel(sessionsOccurances.name)
    readonly repo_model: Model<sessionsOccurances>,
  ) {
    super(repo_model);
  }
}
