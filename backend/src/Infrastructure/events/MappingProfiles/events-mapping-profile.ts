import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { events } from 'src/@domain';
import { listEventsDto } from '../DTOs';

@Injectable()
export class eventsMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        events,
        listEventsDto,
        forMember(
          (destination) => destination.tags,
          mapFrom((source) => source.tags ?? []),
        ),
      );
    };
  }
}
