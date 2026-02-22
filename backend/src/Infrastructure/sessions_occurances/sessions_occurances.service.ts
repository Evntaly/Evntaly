import { Injectable } from '@nestjs/common';
import { createSessionsOccuranceDTO } from './DTOs';
import { sessionsOccurances } from 'src/@domain';
import { sessionsOccurancesRepository } from './sessions_occurances.repository';

@Injectable()
export class sessionsOccurancesService {
  constructor(
    private readonly sesionOcrnsRepository: sessionsOccurancesRepository,
  ) {}

  async createOrUpdate(dto: createSessionsOccuranceDTO) {
    const new_event_occurance: sessionsOccurances = {
      composite_ID: `${dto.tenantID}-${dto.projectID}-${dto.parentEventID}-${dto.sessionID}`,
      ...dto,
    };
    new_event_occurance.updatedAt = new Date();

    // Check if this session occurance happened bfore
    const occurance = await this.sesionOcrnsRepository.findOneByCondition({
      composite_ID: `${dto.tenantID}-${dto.projectID}-${dto.parentEventID}-${dto.sessionID}`,
    });

    if (occurance) {
      return await this.sesionOcrnsRepository.patch(occurance['_id'], {
        $inc: { occurances_count: 1 },
        $set: { updatedAt: new Date() },
      });
    }

    return await this.sesionOcrnsRepository.create(new_event_occurance);
  }

  details(query) {
    return this.sesionOcrnsRepository.findOneByCondition(query);
  }

  async deleteMany(tenantID: string, parentEventID: string, projectID: string) {
    return await this.sesionOcrnsRepository.deleteManyByCondition({
      tenantID: tenantID,
      parentEventID: parentEventID,
      projectID: projectID,
    });
  }

  async deleteAll(query) {
    return await this.sesionOcrnsRepository.deleteManyByCondition(query);
  }

  async count(tenantID: string, projectID: string, parentEventID: string) {
    return await this.sesionOcrnsRepository.aggregate([
      {
        $match: {
          parentEventID: parentEventID,
          tenantID: tenantID,
          projectID: projectID,
          occurances_count: { $gt: 0 },
        },
      },
      {
        $count: 'count',
      },
    ]);
  }

  async update(updated_entity: sessionsOccurances) {
    return await this.sesionOcrnsRepository.update(
      updated_entity['_id'],
      updated_entity,
    );
  }

  async update_occurance_count(query: any, attribute: any, value: number) {
    const update = {
      $inc: { [attribute]: value },
      $set: { updatedAt: new Date() },
    };

    return await this.sesionOcrnsRepository.updateOneByCondition(query, update);
  }
}
