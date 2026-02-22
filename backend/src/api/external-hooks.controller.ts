import { Controller, Logger } from '@nestjs/common';
import { accountService } from 'src/Infrastructure';

@Controller({
  path: 'hooks',
  version: '1',
})
export class externalHooksController {
  private readonly logger = new Logger(externalHooksController.name);

  constructor(private accService: accountService) {}
}
