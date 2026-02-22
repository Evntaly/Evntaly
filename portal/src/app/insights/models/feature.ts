export class feature {

  name: string | undefined;

  total_events: number | undefined;

  total_events_performance!: number;

  unique_users_using_feature?: number;

  unique_users_using_feature_performance!: number;

  adoption!: number;

  adoption_performance!: number | undefined;

  usage!: string;

  usage_performance!: number;

  last_seen_active?: Date;

  registeration_date?: Date;

  last_seen_active_time_ago?: string;
}
