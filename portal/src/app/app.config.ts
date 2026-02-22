import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHighlightOptions } from 'ngx-highlightjs';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClient, HttpHandler } from '@angular/common/http';
import { authInterceptor, projectSelectorInterceptor, errorInterceptor } from './core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: authInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: projectSelectorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: errorInterceptor,
      multi: true,
    },
    provideHighlightOptions({
      fullLibraryLoader: () => import('highlight.js'),
    })
  ],
};
