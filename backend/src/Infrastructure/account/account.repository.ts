import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { account } from 'src/@domain';
import { Repository } from '../base.repository';

export class accountRepository extends Repository<account> {
  constructor(
    @InjectModel(account.name)
    readonly repo_model: Model<account>,
  ) {
    super(repo_model);
  }
}
