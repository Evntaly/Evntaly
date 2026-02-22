import { AutoMap } from '@automapper/classes';

export class listEventsDto {
  @AutoMap()
  tenantID: string;

  @AutoMap()
  eventID?: string;

  @AutoMap()
  sessionID?: string;

  @AutoMap()
  parentEventID?: string;

  @AutoMap()
  timestamp?: Date;

  @AutoMap()
  title: string;

  @AutoMap()
  description: string;

  @AutoMap()
  message?: string;

  @AutoMap()
  icon?: string;

  @AutoMap()
  data: any;

  @AutoMap()
  tags?: string[];

  @AutoMap()
  notify?: boolean;

  @AutoMap()
  apply_rule_only?: boolean;

  @AutoMap()
  type?: string;

  @AutoMap()
  user?: any;

  @AutoMap()
  feature?: string;

  @AutoMap()
  topic?: string;

  @AutoMap()
  status?: string;

  @AutoMap()
  createdAt?: Date;

  @AutoMap()
  updatedAt?: Date;

  is_key_event?: boolean;
}
