import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { users } from 'src/@domain';
import { Repository } from '../base.repository';

export class usersRepository extends Repository<users> {
  constructor(@InjectModel(users.name) readonly repo_model: Model<users>) {
    super(repo_model);
  }
}
