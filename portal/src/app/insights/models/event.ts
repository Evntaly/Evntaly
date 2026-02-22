import { user } from "./user";

export class event {
  title?: string;
  updatedAt?: string;
  description?: string;
  parentEventID?: string | null | undefined;
  occurances_count?: number;
  is_key_event?: boolean;
  createdAt?: any;
}
