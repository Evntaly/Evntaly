import { Injectable } from '@nestjs/common';
import { lookupsRepository } from './lookups.repository';

@Injectable()
export class lookupsService {
  constructor(private readonly lkpsRepository: lookupsRepository) {}

  details(query) {
    return this.lkpsRepository.findOneByCondition({
      key: query.key,
    });
  }
}
