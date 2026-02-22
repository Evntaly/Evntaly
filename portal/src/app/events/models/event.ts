import { user } from "./user";

export class event {
  title?: string;
  description?: string;
  icon?: string;
  date?: string;
  isNew?: boolean;
  topic?: string;
  eventID?: string | null | undefined;
  parentEventID?: string | null | undefined;
  data?: object;
  message?: string;
  tags?: string[] = [];
  timestamp?: any;
  user?: user;
  status?: string;
  sessionID?: string;
  feature?: string;
  createdAt?: any;
  context?: {
    sdkVersion?: string;
    sdkRuntime?: string;
    browser?: string;
    runtimeVersion?: string;
  };
  requestContext?: {
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
    location?: {
      country?: string;
      countryCode?: string;
      region?: string;
      city?: string;
      timezone?: string;
      latitude?: number;
      longitude?: number;
    };
    [key: string]: any;
  };
}
