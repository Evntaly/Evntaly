import { Injectable } from '@nestjs/common';
import { createUsersOccuranceDTO } from './DTOs';
import { usersOccurances } from 'src/@domain';
import { userssOccurancesRepository } from './users_occurances.repository';
import { utilitiesService } from 'src/@core/helpers';

@Injectable()
export class usersOccurancesService {
  constructor(
    private readonly usrsOcrnsRepository: userssOccurancesRepository,
    private utils: utilitiesService,
  ) {}

  async createOrUpdate(dto: createUsersOccuranceDTO) {
    const new_event_occurance: usersOccurances = {
      composite_ID: `${dto.tenantID}-${dto.projectID}-${dto.parentEventID}-${dto.userID}`,
      ...dto,
    };
    new_event_occurance.updatedAt = new Date();

    // Check if this user occurance happened bfore
    const occurance = await this.usrsOcrnsRepository.findOneByCondition({
      composite_ID: `${dto.tenantID}-${dto.projectID}-${dto.parentEventID}-${dto.userID}`,
    });

    if (occurance) {
      return await this.usrsOcrnsRepository.patch(occurance['_id'], {
        $inc: { occurances_count: 1 },
        $set: { updatedAt: new Date() },
      });
    }

    return await this.usrsOcrnsRepository.create(new_event_occurance);
  }

  async details(query) {
    return this.usrsOcrnsRepository.findOneByCondition(query);
  }

  async deleteMany(tenantID: string, parentEventID: string, projectID: string) {
    return await this.usrsOcrnsRepository.deleteManyByCondition({
      tenantID: tenantID,
      parentEventID: parentEventID,
      projectID: projectID,
    });
  }

  async deleteAll(query) {
    return await this.usrsOcrnsRepository.deleteManyByCondition(query);
  }

  async count(tenantID: string, projectID: string, parentEventID: string) {
    return await this.usrsOcrnsRepository.aggregate([
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

  async update(updated_entity: usersOccurances) {
    return await this.usrsOcrnsRepository.update(
      updated_entity['_id'],
      updated_entity,
    );
  }

  async update_occurance_count(query: any, attribute: any, value: number) {
    const update = {
      $inc: { [attribute]: value },
      $set: { updatedAt: new Date() },
    };

    return await this.usrsOcrnsRepository.updateOneByCondition(query, update);
  }

  async getUsersEventsOccurances(
    users: any[],
    tenantID: string,
    projectID: string,
    dateRange = 'all time',
  ) {
    const dates = this.utils.getDateRange(dateRange, 2);

    const ids = [];
    users.forEach((user) => ids.push(user.id));

    const query = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          userID: { $in: ids },
          createdAt: {
            $gte: dates.startDate,
            $lt: dates.endDate,
          },
        },
      },
      {
        $group: {
          _id: { userID: '$userID' },
          total_occurances_count: { $sum: '$occurances_count' },
        },
      },
      {
        $project: {
          _id: 0,
          userID: '$_id.userID',
          total_occurances_count: 1,
        },
      },
    ];

    return this.usrsOcrnsRepository.aggregate(query);
  }
}
