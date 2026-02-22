import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseModel } from './base.model';
import { AutoMap } from '@automapper/classes';

class EventContext {
  sdkVersion: string;
  sdkRuntime?: string;
  runtimeVersion?: string;
  operatingSystem?: string;
  browser?: string;
}

class RequestContext {
  ip?: string;
  userAgent?: string;
  referer?: string;
  method?: string;
  url?: string;
  host?: string;
  origin?: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
  contentType?: string;
  xForwardedProto?: string;
  xForwardedHost?: string;
  xRequestedWith?: string;
  authorization?: string;
  cfIpCountry?: string;
  cfRay?: string;
  os?: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
  deviceType?: string;
  location?: {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  };
  referrerInfo?: {
    type: string;
    domain: string | null;
    hostname: string | null;
    source: string;
    searchEngine: string | null;
    socialNetwork: string | null;
    aiEngine: string | null;
    isInternal: boolean;
  };
  utm?: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    term: string | null;
    content: string | null;
  };
  [key: string]: any; // Allow for additional custom headers
}

export type EventsDocument = Document & events;

@Schema({ collection: 'events' })
export class events extends baseModel {
  @AutoMap()
  @Prop({ required: true })
  tenantID: string;

  @AutoMap()
  @Prop({ required: true })
  projectID: string;

  @AutoMap()
  @Prop({ required: true })
  eventID?: string;

  @AutoMap()
  @Prop({ required: false, default: '' })
  sessionID?: string;

  @AutoMap()
  @Prop({ required: true })
  parentEventID?: string;

  @AutoMap()
  @Prop({ required: false, default: Date.now })
  timestamp?: Date;

  @AutoMap()
  @Prop({ required: true, default: 'No title provided' })
  title: string;

  @AutoMap()
  @Prop({ required: true, default: 'No description provided' })
  description: string;

  @AutoMap()
  @Prop({ required: false, default: 'No message provided' })
  message?: string;

  @AutoMap()
  @Prop({ required: false, default: '👋' })
  icon?: string;

  @AutoMap()
  @Prop({ required: false, default: {}, type: {} })
  data: any;

  @AutoMap()
  @Prop({ required: false, default: [] })
  tags?: [string];

  @AutoMap()
  @Prop({ required: false, default: false })
  notify?: boolean;

  @AutoMap()
  @Prop({ required: false, default: true })
  apply_rule_only?: boolean;

  @AutoMap()
  @Prop({ required: false, default: '' })
  type?: string;

  @AutoMap()
  @Prop({ required: false, default: {}, type: {} })
  user?: any;

  @AutoMap()
  @Prop({ required: false, default: '' })
  feature?: string;

  @AutoMap()
  @Prop({ required: false, default: '' })
  topic?: string; // topic id

  @AutoMap()
  @Prop({ required: false, default: 'New' })
  status?: string;

  @AutoMap()
  @Prop({
    required: false,
    type: EventContext,
  })
  context: EventContext;

  @AutoMap()
  @Prop({
    required: false,
    type: RequestContext,
  })
  requestContext: RequestContext;
}
export const EventsSchema = SchemaFactory.createForClass(events);
