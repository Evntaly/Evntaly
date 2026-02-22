import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { usersOccurances } from 'src/@domain';
import { Repository } from '../base.repository';

export class userssOccurancesRepository extends Repository<usersOccurances> {
  constructor(
    @InjectModel(usersOccurances.name)
    readonly repo_model: Model<usersOccurances>,
  ) {
    super(repo_model);
  }
}
