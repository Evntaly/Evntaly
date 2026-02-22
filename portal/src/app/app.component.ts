import { APP_INITIALIZER, AfterViewInit, Component, ElementRef, Inject, LOCALE_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ThemeModule } from './theme/theme.module';
import { CommonModule, DOCUMENT, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { authInterceptor, httpService } from './core';
import { filter } from 'rxjs';
declare var NioApp: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ThemeModule,
    HttpClientModule,
    CommonModule,
  ],
  providers: [
    httpService,
    HttpClient,
    DatePipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'evntaly-portal';
  is_basic_layout = false;
  is_generic_layout = false;

  constructor(@Inject(DOCUMENT) private document: any, private elementRef: ElementRef, private router: Router){
    this.checkBasicLayoutRoutes();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkBasicLayoutRoutes();
      window.scrollTo(0, 0);
    });
  }

  checkBasicLayoutRoutes(): void {
    const module_paths = ['account'];
    const excluded_paths = ['account/settings'];
    const url = this.router.url;

    const is_excluded = excluded_paths.some((excluded_path) =>
      url.includes(excluded_path)
    );

    const is_from_specific_module = module_paths.some((module_path) =>
      url.startsWith('/' + module_path)
    );

    if (is_from_specific_module && !is_excluded) {
      this.is_basic_layout = true;
      this.is_generic_layout = false;
    } else {
      this.is_basic_layout = false;
      this.is_generic_layout = true;
    }
  }

  ngAfterViewInit(): void {
    // NioApp.TGL.init();
  };
}
