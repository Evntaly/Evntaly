import { Component } from '@angular/core';
import { httpService, InternalEventsService, urls, helpers } from '../../../core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'dashboard-traffic-source',
  templateUrl: './traffic-source.component.html',
  styleUrls: ['./traffic-source.component.css']
})
export class TrafficSourceComponent {
  selected_tab: string = 'traffic_source';
  selected_filter: string = 'Last 7 Days';
  trafficSourceData: any[] = [];
  trafficTypeData: any[] = [];

  constructor(private http: httpService, private eventService: InternalEventsService) {
    this.eventService.internalEvent$.subscribe((event: any) => {
      console.log('event', event, this.selected_tab);
      this.selected_filter = event;
      this.onTabSwitch(this.selected_tab);
    });
  }

  ngOnInit() {
    this.onTabSwitch('traffic-sources');
  }

  onTabSwitch(tabName: string) {
    this.selected_tab = tabName;
    if (tabName === 'traffic-sources') {
      this.loadTrafficSourceData(this.selected_filter);
    } else if (tabName === 'traffic-types') {
      this.loadTrafficTypeData(this.selected_filter);
    }
  }

  private normalizeDomain(url: string): string {
    if (!url) return url;
    if (url.toLowerCase() === 'direct' || url.toLowerCase() === 'other') return url;

    try {
      let domain = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      domain = domain.split('/')[0];
      domain = domain.split(':')[0];

      const parts = domain.split('.');
      if (parts.length > 2) {
        const twoPartTlds = ['co.uk', 'com.au', 'co.jp', 'co.in', 'org.uk', 'ac.uk', 'gov.uk'];
        const lastTwo = parts.slice(-2).join('.');
        if (twoPartTlds.includes(lastTwo)) {
          return parts.slice(-3).join('.');
        }
        return parts.slice(-2).join('.');
      }
      return domain;
    } catch (error) {
      return url;
    }
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }


  private loadTrafficSourceData(selected_filter: string) {
    this.http.Get(`${urls.GET_TRAFFIC_SOURCE_CHART}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      const aggregatedMap = new Map<string, any>();

      result.forEach((item: any) => {
        const normalizedName = this.normalizeDomain(item.name);
        if (aggregatedMap.has(normalizedName)) {
          const existing = aggregatedMap.get(normalizedName);
          existing.value += item.value;
        } else {
          aggregatedMap.set(normalizedName, { ...item, name: normalizedName });
        }
      });

      this.trafficSourceData = Array.from(aggregatedMap.values());

      this.trafficSourceData.forEach((item: any) => {
        item.imageSrc = helpers.getWebsiteLogo(item.name);
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.isImageNonResolvable = item.name.toLowerCase() === 'direct' || item.name.toLowerCase() === 'other' || item.name.toLowerCase().includes('unknown');
      });
    });
  }

  private loadTrafficTypeData(selected_filter: string) {
    this.http.Get(`${urls.GET_TRAFFIC_TYPE_CHART}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.trafficTypeData = result;
      this.trafficTypeData.forEach((item: any) => {
        item.name = this.capitalizeFirstLetter(item.name);
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = false;
        item.valueLabel = 'Events';
      });
    });
  }
}
