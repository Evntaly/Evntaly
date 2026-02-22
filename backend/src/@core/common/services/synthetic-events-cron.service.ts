/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  accountRepository,
  createEventDTO,
  createUserDTO,
} from 'src/Infrastructure';

@Injectable()
export class SyntheticEventsCronService {
  private readonly logger = new Logger(SyntheticEventsCronService.name);

  private readonly baseUrl: string;
  private readonly isEnabled: boolean;
  private readonly demoAccountEmail: string;
  private readonly maxUsersPerHour: number;
  private readonly maxEventsPerUser: number;
  private readonly eventDelayMs: number;
  private readonly cronSchedule: string;

  constructor(
    private readonly accountRepository: accountRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = 'https://app.evntaly.com/prod/api/v1';
    this.isEnabled = true;
    this.demoAccountEmail = 'demo@evntaly.com';
    this.maxUsersPerHour = 20;
    this.maxEventsPerUser = 10;
    this.eventDelayMs = 100;

    this.logger.log(
      `[CronJob] Synthetic Events Cron Service initialized - Enabled: ${this.isEnabled}`,
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleSyntheticEvents() {
    if (!this.isEnabled) {
      this.logger.debug('[CronJob] Synthetic events cron job is disabled');
      return;
    }

    this.logger.log('[CronJob] Starting synthetic events cron job');

    try {
      const accounts = await this.accountRepository.findAllByCondition(
        {
          email: this.demoAccountEmail,
        },
        ['tenantID', 'developer_secret', 'projects'],
      );

      if (accounts.length === 0) {
        this.logger.warn(
          `[CronJob] Demo account (${this.demoAccountEmail}) not found or not active`,
        );
        return;
      }

      this.logger.log(
        `[CronJob] Found demo account, processing synthetic events`,
      );

      const account = accounts[0];

      if (!account.projects || account.projects.length === 0) {
        this.logger.warn('[CronJob] Demo account has no projects');
        return;
      }

      for (const project of account.projects) {
        if (
          !project.projectID ||
          !project.tokens ||
          project.tokens.length === 0
        ) {
          continue;
        }

        const patToken = project.tokens[0];

        try {
          await this.processAccountProject(
            account.tenantID,
            account.developer_secret,
            project.projectID,
            patToken,
          );
        } catch (error) {
          this.logger.error(
            `[CronJob] Error processing demo account project ${project.projectID}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log('[CronJob] Synthetic events cron job completed');
    } catch (error) {
      this.logger.error(
        `[CronJob] Error in synthetic events cron job: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processAccountProject(
    tenantID: string,
    developerSecret: string,
    projectID: string,
    patToken: string,
  ) {
    const accountKey = `${tenantID}-${projectID}`;

    // Generate 0 to maxUsersPerHour random synthetic users per hour (not from saved accounts)
    const hourlyUserCount = Math.floor(
      Math.random() * (this.maxUsersPerHour + 1),
    ); // 0 to maxUsersPerHour

    if (hourlyUserCount === 0) {
      this.logger.debug(
        `[CronJob] No users selected for hourly events for account ${accountKey}`,
      );
      return;
    }

    this.logger.debug(
      `[CronJob] Processing ${hourlyUserCount} synthetic users for account ${accountKey} (max: ${this.maxUsersPerHour})`,
    );

    for (let i = 0; i < hourlyUserCount; i++) {
      const syntheticUser = this.generateSyntheticUserData();

      try {
        await this.registerUserViaHTTP(
          developerSecret,
          patToken,
          syntheticUser,
        );
      } catch (error) {
        this.logger.error(
          `[CronJob] Error registering user ${syntheticUser.id}: ${error.message}`,
        );
      }

      const eventCount = Math.floor(
        Math.random() * (this.maxEventsPerUser + 1),
      );

      this.logger.debug(
        `[CronJob] User ${syntheticUser.id} will send ${eventCount} events for account ${accountKey} (max: ${this.maxEventsPerUser})`,
      );

      for (let j = 0; j < eventCount; j++) {
        try {
          await this.registerEventViaHTTP(
            developerSecret,
            patToken,
            syntheticUser,
          );
          await this.sleep(this.eventDelayMs);
        } catch (error) {
          this.logger.error(
            `[CronJob] Error creating synthetic event for user ${syntheticUser.id}: ${error.message}`,
          );
        }
      }
    }
  }

  private generateSyntheticUserData(): any {
    const firstNames = [
      'Alex',
      'Jordan',
      'Taylor',
      'Morgan',
      'Casey',
      'Riley',
      'Avery',
      'Quinn',
      'Sage',
      'River',
      'Skyler',
      'Phoenix',
      'Blake',
      'Cameron',
      'Dakota',
      'Emery',
      'Finley',
      'Harper',
      'Hayden',
      'Jamie',
    ];
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
    ];
    const organizations = [
      'Acme Corp',
      'Tech Solutions Inc',
      'Digital Innovations',
      'Cloud Services Ltd',
      'Data Analytics Co',
      'Software Systems',
      'Web Development Group',
      'Mobile Apps LLC',
      'Enterprise Solutions',
      'Startup Ventures',
    ];
    const domains = [
      'example.com',
      'testmail.com',
      'demo.org',
      'sample.net',
      'mock.io',
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const userId = `synthetic_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const organization =
      organizations[Math.floor(Math.random() * organizations.length)];

    return {
      id: userId,
      email: email,
      full_name: fullName,
      organization: organization,
      data: {
        source: 'synthetic',
        created_by: 'cron_job',
        created_at: new Date().toISOString(),
      } as any,
    };
  }

  private async registerUserViaHTTP(
    developerSecret: string,
    patToken: string,
    user: any,
  ): Promise<void> {
    const userDTO = new createUserDTO();
    userDTO.id = user.id;
    userDTO.email = user.email;
    userDTO.full_name = user.full_name;
    userDTO.organization = user.organization;
    userDTO.data = user.data;

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/register/user`, userDTO, {
          headers: {
            secret: developerSecret,
            pat: patToken,
            'internal-demo-call': 'true',
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.debug(
        `[CronJob] Registered user ${user.id} via HTTP endpoint`,
      );
    } catch (error: any) {
      // User might already exist, which is fine
      if (error?.response?.status === 400) {
        this.logger.debug(`[CronJob] User ${user.id} may already exist`);
      } else {
        throw error;
      }
    }
  }

  private async registerEventViaHTTP(
    developerSecret: string,
    patToken: string,
    user: any,
  ): Promise<void> {
    const eventDTO = new createEventDTO();
    eventDTO.title = this.getRandomEventTitle();
    eventDTO.description = this.getRandomEventDescription();
    eventDTO.message = this.getRandomEventMessage();
    eventDTO.icon = this.getRandomIcon();
    eventDTO.data = this.getRandomEventData();
    eventDTO.tags = this.getRandomTags() as [string];
    eventDTO.notify = Math.random() > 0.7; // 30% chance of notification
    eventDTO.apply_rule_only = Math.random() > 0.5;
    eventDTO.type = this.getRandomEventType();
    eventDTO.feature = this.getRandomFeatureName();
    eventDTO.user = {
      id: user.id,
      full_name: user.full_name || `User ${user.id}`,
      email: user.email || `user${user.id}@example.com`,
    };
    eventDTO.sessionID =
      Math.random() > 0.3 ? this.generateSessionID() : undefined;
    eventDTO.requestContext = this.generateRealisticRequestContext();
    eventDTO.context = this.generateRealisticContext();

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/register/event`, eventDTO, {
          headers: {
            secret: developerSecret,
            pat: patToken,
            'internal-demo-call': 'true',
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.debug(
        `[CronJob] Registered event via HTTP endpoint for user ${user.id}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[CronJob] Error registering event via HTTP: ${error?.message || error}`,
        error?.response?.data,
      );
      throw error;
    }
  }

  private generateRealisticRequestContext(): any {
    const countries = [
      {
        code: 'US',
        name: 'United States',
        city: 'New York',
        region: 'NY',
        timezone: 'America/New_York',
        lat: 40.7128,
        lon: -74.006,
      },
      {
        code: 'GB',
        name: 'United Kingdom',
        city: 'London',
        region: 'England',
        timezone: 'Europe/London',
        lat: 51.5074,
        lon: -0.1278,
      },
      {
        code: 'CA',
        name: 'Canada',
        city: 'Toronto',
        region: 'Ontario',
        timezone: 'America/Toronto',
        lat: 43.6532,
        lon: -79.3832,
      },
      {
        code: 'DE',
        name: 'Germany',
        city: 'Berlin',
        region: 'Berlin',
        timezone: 'Europe/Berlin',
        lat: 52.52,
        lon: 13.405,
      },
      {
        code: 'FR',
        name: 'France',
        city: 'Paris',
        region: 'Île-de-France',
        timezone: 'Europe/Paris',
        lat: 48.8566,
        lon: 2.3522,
      },
      {
        code: 'AU',
        name: 'Australia',
        city: 'Sydney',
        region: 'NSW',
        timezone: 'Australia/Sydney',
        lat: -33.8688,
        lon: 151.2093,
      },
      {
        code: 'JP',
        name: 'Japan',
        city: 'Tokyo',
        region: 'Tokyo',
        timezone: 'Asia/Tokyo',
        lat: 35.6762,
        lon: 139.6503,
      },
      {
        code: 'BR',
        name: 'Brazil',
        city: 'São Paulo',
        region: 'SP',
        timezone: 'America/Sao_Paulo',
        lat: -23.5505,
        lon: -46.6333,
      },
      {
        code: 'IN',
        name: 'India',
        city: 'Mumbai',
        region: 'Maharashtra',
        timezone: 'Asia/Kolkata',
        lat: 19.076,
        lon: 72.8777,
      },
      {
        code: 'CN',
        name: 'China',
        city: 'Shanghai',
        region: 'Shanghai',
        timezone: 'Asia/Shanghai',
        lat: 31.2304,
        lon: 121.4737,
      },
    ];

    const browsers = [
      { name: 'Chrome', version: '120.0', os: 'Windows', osVersion: '10' },
      { name: 'Chrome', version: '121.0', os: 'macOS', osVersion: '14.2' },
      { name: 'Firefox', version: '122.0', os: 'Windows', osVersion: '11' },
      { name: 'Safari', version: '17.2', os: 'macOS', osVersion: '14.2' },
      { name: 'Edge', version: '120.0', os: 'Windows', osVersion: '10' },
      {
        name: 'Chrome',
        version: '120.0',
        os: 'Linux',
        osVersion: 'Ubuntu 22.04',
      },
    ];

    const devices = ['desktop', 'mobile', 'tablet'];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const urls = [
      '/dashboard',
      '/products',
      '/checkout',
      '/profile',
      '/settings',
      '/api/events',
      '/api/users',
      '/home',
      '/about',
      '/contact',
    ];

    const country = countries[Math.floor(Math.random() * countries.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const url = urls[Math.floor(Math.random() * urls.length)];

    // Generate UTM parameters (70% chance of having UTMs)
    const hasUtm = Math.random() > 0.3;
    const utm = hasUtm ? this.generateUTMParameters() : null;

    // Generate referrer info (60% chance)
    const hasReferrer = Math.random() > 0.4;
    const referrerInfo = hasReferrer ? this.generateReferrerInfo() : null;

    // Generate IP address
    const ip = this.generateIPAddress();

    // Generate user agent
    const userAgent = this.generateUserAgent(browser, device);

    return {
      ip: ip,
      userAgent: userAgent,
      referer: referrerInfo ? referrerInfo.domain : null,
      method: method,
      url: url,
      host: 'app.evntaly.com',
      origin: 'https://app.evntaly.com',
      acceptLanguage: this.getRandomAcceptLanguage(),
      acceptEncoding: 'gzip, deflate, br',
      contentType: 'application/json',
      xForwardedProto: 'https',
      xForwardedHost: 'app.evntaly.com',
      cfIpCountry: country.code,
      cfRay: this.generateCFRay(),
      os: browser.os,
      osVersion: browser.osVersion,
      browser: browser.name,
      browserVersion: browser.version,
      deviceType: device,
      location: {
        country: country.name,
        countryCode: country.code,
        region: country.region,
        city: country.city,
        timezone: country.timezone,
        latitude: country.lat + (Math.random() - 0.5) * 0.5, // Add some randomness
        longitude: country.lon + (Math.random() - 0.5) * 0.5,
      },
      referrerInfo: referrerInfo,
      utm: utm,
    };
  }

  private generateRealisticContext(): any {
    const sdkVersions = ['2.0.0', '2.0.1', '2.0.2', '2.1.0', '1.9.5'];
    const runtimes = ['node', 'browser', 'react-native', 'flutter'];

    return {
      sdkVersion: sdkVersions[Math.floor(Math.random() * sdkVersions.length)],
      sdkRuntime: runtimes[Math.floor(Math.random() * runtimes.length)],
      runtimeVersion: `v${Math.floor(Math.random() * 20) + 10}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      operatingSystem: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'][
        Math.floor(Math.random() * 5)
      ],
      browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][
        Math.floor(Math.random() * 4)
      ],
    };
  }

  private generateUTMParameters(): any {
    const sources = [
      'google',
      'facebook',
      'twitter',
      'linkedin',
      'email',
      'direct',
      'newsletter',
      'blog',
    ];
    const mediums = [
      'cpc',
      'organic',
      'social',
      'email',
      'referral',
      'display',
      'affiliate',
    ];
    const campaigns = [
      'summer_sale',
      'product_launch',
      'brand_awareness',
      'retargeting',
      'newsletter_signup',
      'trial_promotion',
    ];
    const terms = [
      'evntaly',
      'analytics',
      'event tracking',
      'user analytics',
      'product analytics',
    ];
    const contents = [
      'banner',
      'sidebar',
      'footer',
      'header',
      'popup',
      'inline',
    ];

    return {
      source: sources[Math.floor(Math.random() * sources.length)],
      medium: mediums[Math.floor(Math.random() * mediums.length)],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      term:
        Math.random() > 0.5
          ? terms[Math.floor(Math.random() * terms.length)]
          : null,
      content:
        Math.random() > 0.5
          ? contents[Math.floor(Math.random() * contents.length)]
          : null,
    };
  }

  private generateReferrerInfo(): any {
    const types = ['search', 'social', 'direct', 'internal'];
    const type = types[Math.floor(Math.random() * types.length)];

    let domain: string | null = null;
    let hostname: string | null = null;
    let source = 'direct';
    let searchEngine: string | null = null;
    let socialNetwork: string | null = null;
    const aiEngine: string | null = null;
    const isInternal = type === 'internal';

    if (type === 'search') {
      const engines = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];
      domain = engines[Math.floor(Math.random() * engines.length)];
      hostname = domain;
      source = 'search';
      searchEngine = domain.split('.')[0];
    } else if (type === 'social') {
      const socials = [
        'facebook.com',
        'twitter.com',
        'linkedin.com',
        'instagram.com',
        'reddit.com',
      ];
      domain = socials[Math.floor(Math.random() * socials.length)];
      hostname = domain;
      source = 'social';
      socialNetwork = domain.split('.')[0];
    } else if (type === 'internal') {
      domain = 'app.evntaly.com';
      hostname = 'app.evntaly.com';
      source = 'internal';
    } else {
      domain = null;
      hostname = null;
      source = 'direct';
    }

    return {
      type: type,
      domain: domain,
      hostname: hostname,
      source: source,
      searchEngine: searchEngine,
      socialNetwork: socialNetwork,
      aiEngine: aiEngine,
      isInternal: isInternal,
    };
  }

  private generateIPAddress(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  private generateUserAgent(browser: any, device: string): string {
    if (device === 'mobile') {
      if (browser.name === 'Safari') {
        return `Mozilla/5.0 (iPhone; CPU iPhone OS ${browser.osVersion.replace('.', '_')} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browser.version} Mobile/15E148 Safari/604.1`;
      } else {
        return `Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version} Mobile Safari/537.36`;
      }
    } else if (device === 'tablet') {
      return `Mozilla/5.0 (iPad; CPU OS ${browser.osVersion.replace('.', '_')} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browser.version} Mobile/15E148 Safari/604.1`;
    } else {
      if (browser.os === 'Windows') {
        return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ${browser.name}/${browser.version} Safari/537.36`;
      } else if (browser.os === 'macOS') {
        return `Mozilla/5.0 (Macintosh; Intel Mac OS X ${browser.osVersion.replace('.', '_')}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser.name}/${browser.version} Safari/537.36`;
      } else {
        return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ${browser.name}/${browser.version} Safari/537.36`;
      }
    }
  }

  private generateCFRay(): string {
    const chars = '0123456789abcdef';
    let ray = '';
    for (let i = 0; i < 8; i++) {
      ray += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ray;
  }

  private getRandomAcceptLanguage(): string {
    const languages = [
      'en-US,en;q=0.9',
      'en-GB,en;q=0.9',
      'fr-FR,fr;q=0.9',
      'de-DE,de;q=0.9',
      'es-ES,es;q=0.9',
      'ja-JP,ja;q=0.9',
      'zh-CN,zh;q=0.9',
    ];
    return languages[Math.floor(Math.random() * languages.length)];
  }

  private getRandomFeatureName(): string {
    const features = [
      'user_authentication',
      'payment_processing',
      'dashboard_analytics',
      'notification_system',
      'file_management',
      'user_profile',
      'search_functionality',
      'shopping_cart',
      'product_catalog',
      'settings_panel',
      'messaging_system',
      'reporting_module',
      'integration_hub',
      'data_export',
      'api_access',
    ];
    return features[Math.floor(Math.random() * features.length)];
  }

  private getRandomEventTitle(): string {
    const titles = [
      'User Login',
      'Page View',
      'Button Click',
      'Form Submission',
      'Purchase Completed',
      'Product Viewed',
      'Search Performed',
      'Video Played',
      'File Downloaded',
      'Profile Updated',
      'Settings Changed',
      'Notification Sent',
      'Email Opened',
      'Link Clicked',
      'Cart Updated',
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private getRandomEventDescription(): string {
    const descriptions = [
      'User performed an action on the platform',
      'Event triggered by user interaction',
      'System event generated automatically',
      'User activity detected',
      'Action completed successfully',
      'Event logged for analytics',
      'User engagement event',
      'Platform interaction recorded',
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getRandomEventMessage(): string {
    const messages = [
      'Event processed successfully',
      'User action completed',
      'Event logged and tracked',
      'Analytics data captured',
      'User interaction recorded',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getRandomIcon(): string {
    const icons = [
      '📊',
      '👤',
      '🔔',
      '📧',
      '🛒',
      '🔍',
      '📱',
      '💻',
      '⚙️',
      '🎯',
      '📈',
      '✅',
      '🔗',
      '📄',
      '🎬',
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  private getRandomEventData(): any {
    const dataTypes = [
      {
        type: 'purchase',
        amount: Math.floor(Math.random() * 1000) + 10,
        currency: 'USD',
      },
      {
        type: 'page_view',
        duration: Math.floor(Math.random() * 300) + 10,
        page: '/dashboard',
      },
      {
        type: 'click',
        element: 'button',
        position: {
          x: Math.floor(Math.random() * 1920),
          y: Math.floor(Math.random() * 1080),
        },
      },
      {
        type: 'form_submit',
        formId: `form-${Math.floor(Math.random() * 10)}`,
        fields: Math.floor(Math.random() * 5) + 1,
      },
      {
        type: 'search',
        query: 'test query',
        results: Math.floor(Math.random() * 50),
      },
    ];
    return dataTypes[Math.floor(Math.random() * dataTypes.length)];
  }

  private getRandomTags(): string[] {
    const allTags = [
      'user-action',
      'engagement',
      'conversion',
      'analytics',
      'tracking',
      'event',
      'interaction',
      'system',
      'automated',
    ];
    const tagCount = Math.floor(Math.random() * 3) + 1; // 1-3 tags
    const shuffled = this.shuffleArray([...allTags]);
    return shuffled.slice(0, tagCount);
  }

  private getRandomEventType(): string {
    const types = ['user', 'system', 'automated', 'manual', 'api', 'webhook'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateSessionID(): string {
    return `sess_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
