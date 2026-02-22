import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly appName = 'Evntaly';

  constructor(private titleService: Title) {}

  // Set page title with automatic app name suffix
  setTitle(title: string): void {
    const fullTitle = title.includes(this.appName) ? title : `${title} - ${this.appName}`;
    this.titleService.setTitle(fullTitle);
  }

  // Set title for specific pages
  setDashboardTitle(): void {
    this.setTitle('Dashboard');
  }

  setEventsTitle(): void {
    this.setTitle('All Events');
  }

  setEventDetailsTitle(eventName?: string): void {
    const title = eventName ? `${eventName} - Event Details` : 'Event Details';
    this.setTitle(title);
  }

  setIntegrationsTitle(): void {
    this.setTitle('Integrations');
  }

  setInsightsTitle(type?: string): void {
    const titles: { [key: string]: string } = {
      'features': 'Feature Analytics',
      'topics': 'Topic Analytics',
      'users': 'User Analytics',
      'events': 'Event Analytics'
    };
    const title = type && titles[type] ? titles[type] : 'Insights';
    this.setTitle(title);
  }

  setUserDetailsTitle(userName?: string): void {
    const title = userName ? `${userName} - User Profile` : 'User Profile';
    this.setTitle(title);
  }

  setJourneysTitle(): void {
    this.setTitle('User Journeys');
  }

  setSignUpTitle(): void {
    this.setTitle('Sign Up');
  }

  setSignInTitle(): void {
    this.setTitle('Sign In');
  }

  setForgotPasswordTitle(): void {
    this.setTitle('Reset Password');
  }

  setResetPasswordTitle(): void {
    this.setTitle('Set New Password');
  }

  setLoadingTitle(): void {
    this.setTitle('Loading');
  }

  setFunnelsTitle(): void {
    this.setTitle('Funnels');
  }

  setSettingsTitle(section?: string): void {
    const titles: { [key: string]: string } = {
      'projects': 'Project Settings',
      'api': 'API Settings',
      'info': 'Account Information',
      'security': 'Security Settings'
    };
    const title = section && titles[section] ? titles[section] : 'Settings';
    this.setTitle(title);
  }
}
