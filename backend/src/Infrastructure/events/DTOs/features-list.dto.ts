export class featuresListDTO {
  name: string;

  total_events: number;

  total_events_performance: number;

  unique_users_using_feature?: number;

  unique_users_using_feature_performance: number;

  adoption: number; // out of 100

  adoption_performance: number; //out of 100

  usage: string;

  usage_performance: number;

  last_seen_active?: Date;

  registeration_date?: Date;
}
