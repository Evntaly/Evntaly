import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'occurances',
    loadChildren: () => import('./events/events.module').then(m => m.EventsModule)
  },
  {
    path: 'integrations',
    loadChildren: () => import('./integrations/integrations.module').then(m => m.IntegrationsModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./developer-account/developer-account.module').then(m => m.DeveloperAccountModule)
  },
  {
    path: 'insights',
    loadChildren: () => import('./insights/insights.module').then(m => m.InsightsModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'journeys',
    loadChildren: () => import('./journeys/journeys.module').then(m => m.JourneysModule)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
