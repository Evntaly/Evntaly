export class eventsSearchCriteria {
  metadata?: string;
  tags?: string[] = [];
  userKey?: string;
  featureKey?: string;
  topicKey?: string;
  range?: string = 'today';
  status?: string = 'New';
}
