import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { integrations } from 'src/@domain';
import { Repository } from '../base.repository';

export class integrationsRepository extends Repository<integrations> {
  constructor(
    @InjectModel(integrations.name) readonly repo_model: Model<integrations>,
  ) {
    super(repo_model);
  }
}
