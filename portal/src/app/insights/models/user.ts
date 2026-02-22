export class user {
  id?: string;

  full_name?: string;

  email?: string;

  organization?: number;

  last_seen_active: Date = new Date();

  last_seen_active_time_ago?: string;

  registeration_date?: Date;

  is_gold_user?: boolean;

  is_silver_user?: boolean;

  total_number_of_events?: number;

  events_performance?: number;

  createdAt?: Date;

  name_init?: string;

  avatar_cover?: string;
}
