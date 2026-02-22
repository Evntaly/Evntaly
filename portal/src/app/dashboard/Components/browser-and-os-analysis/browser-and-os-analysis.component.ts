import { Component, OnInit } from '@angular/core';
import { InternalEventsService } from '../../../core/services/internal-events.service';
import { httpService } from '../../../core/services/http';
import { urls } from '../../../core/helpers/urls';
import { helpers } from '../../../core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'dashboard-browser-and-os-analysis',
  templateUrl: './browser-and-os-analysis.component.html',
  styleUrls: ['./browser-and-os-analysis.component.css']
})
export class BrowserAndOsAnalysisComponent implements OnInit {
  selected_tab: string = 'browser';
  selected_filter: string = 'Last 7 Days';

  browserData: any[] = [];

  browserVersionData: any[] = [];

  osData: any[] = [];

  osVersionData: any[] = [];

  deviceTypeData: any[] = [];

  constructor(private http: httpService, private eventService: InternalEventsService) {
    this.eventService.internalEvent$.subscribe((event: any) => {
      this.selected_filter = event;
      this.onTabSwitch(this.selected_tab);
    });
  }

  ngOnInit() {
    this.onTabSwitch('browsers');
  }

  onTabSwitch(tabName: string) {
    this.selected_tab = tabName;

    switch(tabName) {
      case 'browsers':
        this.loadBrowsersData(this.selected_filter);
        break;
      case 'browser-versions':
        this.loadBrowserVersionData(this.selected_filter);
        break;
      case 'os':
        this.loadOsData(this.selected_filter);
        break;
      case 'os-version':
        this.loadOsVersionData(this.selected_filter);
        break;
      case 'device-type':
        this.loadDeviceTypeData(this.selected_filter);
        break;
      default:
        console.warn('Unknown tab:', tabName);
    }
  }

  private loadBrowsersData(selected_filter: string) {
    this.http.Get(`${urls.BROWSERS_DATA_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.browserData = result;
      this.browserData.forEach((item: any) => {
        item.imageSrc = helpers.getBrowserLogo(item.name);
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.isImageNonResolvable = item.name.toLowerCase() === 'other' || item.name.toLowerCase().includes('unknown');
      });
      // this.browserData = [];
    });
  }

  private loadBrowserVersionData(selected_filter: string) {
    this.http.Get(`${urls.BROWSERS_VERSIONS_DATA_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.browserVersionData = result;
      this.browserVersionData.forEach((item: any) => {
        item.imageSrc = helpers.getBrowserLogo(item.browser);
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.name = `${item.browser} (${item.name})`;
        item.isImageNonResolvable = item.name.toLowerCase() === 'other' || item.browser.toLowerCase().includes('unknown');
      });
    });
  }

  private loadOsData(selected_filter: string) {
    this.http.Get(`${urls.OS_DATA_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.osData = result;
      this.osData.forEach((item: any) => {
        item.imageSrc = helpers.getOSLogo(item.name);
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.isImageNonResolvable = item.name.toLowerCase() === 'other' || item.name.toLowerCase().includes('unknown');
      });
    });
  }

  private loadOsVersionData(selected_filter: string) {
    this.http.Get(`${urls.OS_VERSIONS_DATA_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.osVersionData = result;
      this.osVersionData.forEach((item: any) => {
        item.imageSrc = helpers.getOSLogo(item.os);
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.name = `${item.os} (${item.name})`;
        item.isImageNonResolvable = item.name.toLowerCase() === 'other' || item.os.toLowerCase().includes('unknown')
      });
    });
  }

  private loadDeviceTypeData(selected_filter: string) {
    this.http.Get(`${urls.DEVICE_TYPE_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.deviceTypeData = result;
      this.deviceTypeData.forEach((item: any) => {
        item.imageSrc = helpers.getDeviceTypeLogo(item.name);
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.isImageNonResolvable = item.name.toLowerCase() === 'other' || item.name.toLowerCase().includes('unknown');
      });
    });
  }
}
