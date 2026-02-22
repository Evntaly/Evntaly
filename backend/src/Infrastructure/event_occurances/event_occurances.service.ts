import { Injectable } from '@nestjs/common';
import { eventOccurancesRepository } from './event_occurances.repository';
import { createEventOccuranceDTO } from './DTOs';
import { eventOccurances } from 'src/@domain';
import { utilitiesService } from 'src/@core/helpers';
// import { eventOccurances } from 'src/@domain';

@Injectable()
export class eventOccurancesService {
  constructor(
    private readonly evntOcrnsRepository: eventOccurancesRepository,
    private utils: utilitiesService,
  ) {}

  async createOrUpdate(dto: createEventOccuranceDTO) {
    const new_event_occurance: eventOccurances = {
      ...dto,
    };
    new_event_occurance.updatedAt = new Date();

    // Check if this event happened bfore
    const event = await this.evntOcrnsRepository.findOneByCondition({
      title: new_event_occurance.title,
      tenantID: new_event_occurance.tenantID,
      projectID: new_event_occurance.projectID,
    });

    if (event) {
      return await this.evntOcrnsRepository.patch(event['_id'], {
        $inc: { occurances_count: 1 },
        $set: { updatedAt: new Date() },
      });
    }

    new_event_occurance.parentEventID = this.utils.generateEventID('PA-EV');
    return await this.evntOcrnsRepository.create(new_event_occurance);
  }

  async configureActivationPipeline(
    eventTitle: string,
    eventOrder: number,
    tenantID: string,
    projectID: string,
  ) {
    const new_event_occurance: eventOccurances = new eventOccurances();

    const event = await this.evntOcrnsRepository.findOneByCondition({
      title: eventTitle,
      tenantID: tenantID,
      projectID: projectID,
    });

    const is_step_configured =
      await this.evntOcrnsRepository.findOneByCondition({
        key_event_order: eventOrder,
        tenantID: tenantID,
        projectID: projectID,
      });

    // To remove the already configured step
    if (is_step_configured) {
      await this.evntOcrnsRepository.patch(is_step_configured['_id'], {
        $set: { is_key_event: false, key_event_order: -1 },
      });
    }

    if (event) {
      return await this.evntOcrnsRepository.patch(event['_id'], {
        $set: { is_key_event: true, key_event_order: eventOrder },
      });
    }

    // Create an empty key event with 0 occurances
    new_event_occurance.parentEventID = this.utils.generateEventID('PA-EV');
    new_event_occurance.title = eventTitle;
    new_event_occurance.is_key_event = true;
    new_event_occurance.occurances_count = 0;
    new_event_occurance.tenantID = tenantID;
    new_event_occurance.projectID = projectID;
    new_event_occurance.key_event_order = eventOrder;

    return await this.evntOcrnsRepository.create(new_event_occurance);
  }

  async details(query) {
    return await this.evntOcrnsRepository.findOneByCondition({
      tenantID: query.tenantID,
      projectID: query.projectID,
      parentEventID: query.parentEventID,
    });
  }

  async delete(tenantID: string, parentEventID: string) {
    return await this.evntOcrnsRepository.deleteByCondition({
      tenantID: tenantID,
      parentEventID: parentEventID,
    });
  }

  async update(updated_entity: eventOccurances) {
    return await this.evntOcrnsRepository.update(
      updated_entity['_id'],
      updated_entity,
    );
  }

  async deleteAll(query) {
    return await this.evntOcrnsRepository.deleteManyByCondition(query);
  }

  async update_occurance_count(query: any, attribute: any, value: number) {
    const update = {
      $inc: { [attribute]: value },
      $set: { updatedAt: new Date() },
    };

    return await this.evntOcrnsRepository.updateOneByCondition(query, update);
  }

  async listParentEvents(
    tenantID: string,
    projectID: string,
    query_settings: {
      date_range: string;
      sort_by?: any;
      sort_as?: any;
      search_key?: any;
    },
  ) {
    const dates = this.utils.getDateRange(
      query_settings.date_range || 'today',
      2,
    );

    const query = {
      tenantID: tenantID,
      projectID: projectID,
      updatedAt: { $gte: dates.startDate, $lte: dates.endDate },
      ...(query_settings.search_key
        ? {
            title: { $regex: query_settings.search_key, $options: 'i' },
          }
        : {}),
    };

    const collectionSize = await this.evntOcrnsRepository.count(query);

    const data = await this.evntOcrnsRepository.findAllByCondition(
      query,
      [
        'parentEventID',
        'title',
        'occurances_count',
        'is_key_event',
        'key_event_order',
        'createdAt',
        'updatedAt',
      ],
      0,
      0,
      query_settings.sort_by,
      query_settings.sort_as,
    );

    return {
      data: data,
      collectionSize: collectionSize,
    };
  }

  async getActivationPipelineEvents(tenantID: string, projectID: string) {
    return this.evntOcrnsRepository.findAllByCondition(
      { tenantID: tenantID, projectID: projectID, is_key_event: true },
      [
        'parentEventID',
        'title',
        'occurances_count',
        'is_key_event',
        'key_event_order',
      ],
    );
  }
}
