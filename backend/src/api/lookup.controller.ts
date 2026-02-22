import { Controller, Get, Logger } from '@nestjs/common';
import { lookupsService } from 'src/Infrastructure';

@Controller({
  path: 'lookups',
  version: '1',
})
export class lookupController {
  private readonly logger = new Logger(lookupController.name);

  constructor(private lkps: lookupsService) {}

  @Get('search-options')
  async getSearchOptions() {
    return this.lkps.details({ key: 'search-options' });
  }

  @Get('role-triggers')
  async getRoleTriggers() {
    return this.lkps.details({ key: 'role-triggers' });
  }

  @Get('role-conditions')
  async getRoleConditions() {
    return this.lkps.details({ key: 'role-conditions' });
  }

  @Get('role-condition-periods')
  async getRoleConditionPeriods() {
    return this.lkps.details({ key: 'role-condition-periods' });
  }

  @Get('role-alarm-methods')
  async getAlarmMethods() {
    return this.lkps.details({ key: 'role-alarm-methods' });
  }
}
