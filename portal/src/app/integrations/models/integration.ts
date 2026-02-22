export class integration {
  name?: string;
  icon?: string;
  status?: 'NOT_CONFIGURED' | 'CONFIGURED' | 'PENDING' | 'IS_WIP' | 'ACTIVE';
  loading: boolean = false;
  updated_at?: string;
  updatedAt?: string;
  createdAt?: string;
  action?: any;
  create?: any;
  update?: any;
  configurations?: any;
}
