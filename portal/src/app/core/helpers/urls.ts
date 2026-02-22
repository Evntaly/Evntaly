import { environment } from '../../../environments/environment';

export class urls {
  public static get BASE_URL(): string { return environment.apiBaseUrl };
  public static get IPINFO(): string { return 'https://ipinfo.io/json' };

  public static get GET_EVENTS(): string { return this.BASE_URL + '/events/list' };
  public static get GET_OCCURANCE_DETAILS(): string { return this.BASE_URL + '/events/occurrence/details' };
  public static get GET_EVENT_DETAILS(): string { return this.BASE_URL + '/events/parent/details' };
  public static get EVENTS_OCCURANCES_DATA(): string { return this.BASE_URL + '/events/occurances/chart' };
  public static get GET_EVENTS_KPIs(): string { return this.BASE_URL + '/events/kpis' };
  public static get UPDATE_EVENT_STATUS(): string { return this.BASE_URL + '/events/update-status' };
  public static get DELETE_EVENT_OCCURANCE(): string { return this.BASE_URL + '/events/delete-occurance' };
  public static get DELETE_EVENT(): string { return this.BASE_URL + '/events/delete' };
  public static get FIND_EVENTS(): string { return this.BASE_URL + '/events/find-events' };
  public static get CREATE_ALERT_ON_EVENT(): string { return this.BASE_URL + '/alerts/create' };
  public static get GET_ALERT_PER_PARENT_EVENT(): string { return this.BASE_URL + '/alerts/get-by-parent-event' };
  public static get GET_ALERT_PER_USER(): string { return this.BASE_URL + '/alerts/get-by-user' };
  public static get DELETE_ALERT_PER_PARENT_EVENT(): string { return this.BASE_URL + '/alerts/delete-from-events' };
  public static get DELETE_ALERT_PER_USER(): string { return this.BASE_URL + '/alerts/delete-from-users' };
  public static get LIST_INTEGRATIONS(): string { return this.BASE_URL + '/integrations/list' };
  public static get CREATE_INTEGRATION(): string { return this.BASE_URL + '/integrations/create' };
  public static get UPDATE_INTEGRATION(): string { return this.BASE_URL + '/integrations/update' };
  public static get LIST_SLACK_CHANNELS(): string { return this.BASE_URL + '/integrations/list-slack-channels' };
  public static get JOIN_SLACK_CHANNEL(): string { return this.BASE_URL + '/integrations/join-slack-channel' };
  public static get LIST_FEATURES(): string { return this.BASE_URL + '/features/list' };
  public static get LIST_TOPICS(): string { return this.BASE_URL + '/topics/list' };
  public static get ACTIVE_USERS_CHART(): string { return this.BASE_URL + '/users/active-users/chart' };
  public static get REGISTERED_USERS_CHART(): string { return this.BASE_URL + '/users/registered-users/chart' };
  public static get GET_USERS_LIST(): string { return this.BASE_URL + '/users/list' };
  public static get GET_USER_DETAILS(): string { return this.BASE_URL + '/users/details' };
  public static get USER_ACTIVITY_CHART(): string { return this.BASE_URL + '/users/activity/chart' };
  public static get GET_USER_EVENTS_CHECKLIST(): string { return this.BASE_URL + '/events/key-events-checklist-for-user' };
  public static get GET_USER_VITALS(): string { return this.BASE_URL + '/events/user-vitals' };
  public static get LIST_PARENT_EVENTS(): string { return this.BASE_URL + '/events/list-parent-events' };
  public static get LIST_PIPELINE_EVENTS(): string { return this.BASE_URL + '/events/list-pipelines-events' };
  public static get GET_TRAFFIC_TYPE_CHART(): string { return this.BASE_URL + '/dashboard/traffic-type/chart' };
  public static get GET_TRAFFIC_SOURCE_CHART(): string { return this.BASE_URL + '/dashboard/traffic-source/chart' };

  public static get GET_ALL_USERS_KPI(): string { return this.BASE_URL + '/dashboard/kpis/total-users' };
  public static get GET_NEW_USERS_KPI(): string { return this.BASE_URL + '/dashboard/kpis/total-users' }; // the same as above with filters
  public static get GET_ACTIVE_USERS_KPI(): string { return this.BASE_URL + '/dashboard/kpis/active-users' };
  public static get GET_SESSIONS_KPI(): string { return this.BASE_URL + '/dashboard/kpis/sessions' };
  public static get GET_PAGE_VIEWS_KPI(): string { return this.BASE_URL + '/dashboard/kpis/page-views' };
  public static get GET_DROP_OFF_RATE(): string { return this.BASE_URL + '/dashboard/kpis/drop-off-rate' };
  public static get GET_CONVERSION_RATE(): string { return this.BASE_URL + '/dashboard/kpis/conversion-rate' };
  public static get GET_ONLINE_USERS_KPI(): string { return this.BASE_URL + '/dashboard/kpis/online-users' };
  public static get REGISTERED_USERS_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/registered-users/chart' };
  public static get ACTIVE_USERS_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/active-users/chart' };
  public static get SESSIONS_COUNT_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/sessions-count/chart' };
  public static get COUNTRIES_MAP_DATA_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/countries/chart/map' };
  public static get CITIES_DATA_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/cities/chart' };
  public static get REGIONS_DATA_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/regions/chart' };
  public static get BROWSERS_DATA_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/browsers/chart' };
  public static get BROWSERS_VERSIONS_DATA_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/browser-versions/chart' };
  public static get OS_VERSIONS_DATA_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/os-versions/chart' };
  public static get OS_DATA_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/operating-systems/chart' };
  public static get GET_UTM_SOURCE_CHART(): string { return this.BASE_URL + '/dashboard/utm/source' };
  public static get GET_UTM_MEDIUM_CHART(): string { return this.BASE_URL + '/dashboard/utm/medium' };
  public static get GET_UTM_CAMPAIGN_CHART(): string { return this.BASE_URL + '/dashboard/utm/campaign' };
  public static get GET_UTM_TERM_CHART(): string { return this.BASE_URL + '/dashboard/utm/term' };
  public static get GET_UTM_CONTENT_CHART(): string { return this.BASE_URL + '/dashboard/utm/content' };

  public static get ACTIVATION_ADOPTION(): string { return this.BASE_URL + '/dashboard/activation-adoption/chart' };
  public static get EVENT_TYPE_BREAKDOWN(): string { return this.BASE_URL + '/dashboard/event-type-breakdown/chart' };
  public static get PAGE_VIEWS_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/page-views/chart' };
  public static get URL_VIEWS_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/url-views/chart' };
  public static get DEVICE_TYPE_CHART_DASHBOARD(): string { return this.BASE_URL + '/dashboard/device-type/chart' };

  public static get CREATE_NEW_FUNNEL(): string { return this.BASE_URL + '/funnels/create' };
  public static get LIST_FUNNEL(): string { return this.BASE_URL + '/funnels/list' };
  public static get GET_FUNNEL_DETAILS(): string { return this.BASE_URL + '/funnels/details' };
  public static get DELETE_FUNNEL(): string { return this.BASE_URL + '/funnels/delete' };
  public static get FUNNEL_KPIS(): string { return this.BASE_URL + '/funnels/kpis' };

  public static get GET_ACCOUNT_PROJECTS_LIST(): string { return this.BASE_URL + '/account/projects/list' };
  public static get CREATE_NEW_PROJECT(): string { return this.BASE_URL + '/account/projects/create' };
  public static get UPDATE_PROJECT_NAME(): string { return this.BASE_URL + '/account/projects/update' };
  public static get DELETE_PROJECT(): string { return this.BASE_URL + '/account/projects/delete' };
  public static get LIST_PROJECTS_TOKENS(): string { return this.BASE_URL + '/account/projects/list/tokens' };
  public static get GENERATE_PAT_FOR_PROJECT(): string { return this.BASE_URL + '/account/projects/add-token' };
  public static get DELETE_PAT_FOR_PROJECT(): string { return this.BASE_URL + '/account/projects/delete-token' };
  public static get UPDATE_ACCOUNT_SETTINGS(): string { return this.BASE_URL + '/account/update-account-settings' };
  public static get DELETE_ACCOUNT(): string { return this.BASE_URL + '/account/delete' };
  public static get CREATE_ACCOUNT(): string { return this.BASE_URL + '/account/create' };
  public static get SIGNIN_ACCOUNT(): string { return this.BASE_URL + '/account/signin' };
  public static get UPDATE_ACCOUNT(): string { return this.BASE_URL + '/account/update' };
  public static get GET_ACCOUNT_DETAILS(): string { return this.BASE_URL + '/account/details' };
  public static get GITHUB_ACCESS(): string { return this.BASE_URL + '/account/github/access' };
  public static get GOOGLE_ACCESS(): string { return this.BASE_URL + '/account/google/access' };
  public static get UPDATE_ACCOUNT_PROGRESS(): string { return this.BASE_URL + '/account/update-account-progress' };
  public static get REQUEST_PASSWORD_RESET(): string { return this.BASE_URL + '/account/request-password-reset' };
  public static get RESET_PASSWORD(): string { return this.BASE_URL + '/account/reset-password' };
  public static get GET_LIST_OF_SESSIONS(): string { return this.BASE_URL + '/sessions/list' };
  public static get GET_LIST_OF_EVENTS_IN_SESSION(): string { return this.BASE_URL + '/sessions/list-events' };

  // Lookups
  public static get ROLE_TRIGGERS_LOOKUPS(): string { return this.BASE_URL + '/lookups/role-triggers' };
  public static get REGISTER_EXP_EVENT(): string { return this.BASE_URL + '/register/event' };
  public static get IS_DEVELOPER_AUTHORISED(): string { return this.BASE_URL + '/account/is-authorised' };
}
