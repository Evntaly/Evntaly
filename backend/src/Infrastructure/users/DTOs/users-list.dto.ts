export class usersListDTO {
  id: string;

  full_name: string;

  email: string;

  organization: number;

  createdAt?: Date;

  last_seen_active?: Date;

  registeration_date?: Date;

  is_gold_user?: boolean;

  is_silver_user?: boolean;

  total_number_of_events?: number;
}
