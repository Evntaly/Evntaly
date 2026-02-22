export interface userInfo {
  _id: string;
  updatedAt: Date | null;
  id: string;
  email: string;
  full_name: string;
  organization: string;
  createdAt: Date;
  initials: string;
  data: any;
}

export interface event {
  eventID: string;
  timestamp: Date;
}

export interface firstLastEvents {
  firstEvent: event;
  lastEvent: event;
}

export interface mostUsedFeature {
  count: number;
  feature: string;
}

export interface KPIs {
  sessions_unique_count: number;
  events_count: number;
}

export interface userDetails {
  user: userInfo;
  first_last_events: firstLastEvents;
  most_used_feature: mostUsedFeature;
  kpis: KPIs;
}
