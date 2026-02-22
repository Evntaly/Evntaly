import { Component } from '@angular/core';
import { httpService, InternalEventsService, urls } from '../../../core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'dashboard-utm-paramters',
  templateUrl: './utm-paramters.component.html',
  styleUrls: ['./utm-paramters.component.css']
})
export class UtmParamtersComponent {
  selected_tab: string = 'utm_sources';
  selected_filter: string = 'Last 7 Days';
  utmSourcesData: any[] = [];
  utmMediumsData: any[] = [];
  utmCampaignsData: any[] = [];
  utmTermsData: any[] = [];
  utmContentData: any[] = [];

  constructor(private http: httpService, private eventService: InternalEventsService) {
    this.eventService.internalEvent$.subscribe((event: any) => {
      console.log('event', event, this.selected_tab);
      this.selected_filter = event;
      this.onTabSwitch(this.selected_tab);
    });
  }

  ngOnInit() {
    this.onTabSwitch('utm_sources');
  }

  onTabSwitch(tabName: string) {
    this.selected_tab = tabName;

    switch(tabName) {
      case 'utm_sources':
        this.loadSourceData(this.selected_filter);
        break;
      case 'utm_mediums':
        this.loadMediumData(this.selected_filter);
        break;
      case 'utm_campaigns':
        this.loadCampaignData(this.selected_filter);
        break;
      case 'utm_terms':
        this.loadTermData(this.selected_filter);
        break;
      case 'utm_contents':
        this.loadContentData(this.selected_filter);
        break;
      default:
        console.warn('Unknown tab:', tabName);
    }
  }

  private loadSourceData(selected_filter: string) {
    this.http.Get(`${urls.GET_UTM_SOURCE_CHART}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.utmSourcesData = result;
      this.utmSourcesData.forEach((item: any) => {
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = false;
        item.valueLabel = 'Events';
      });
    });
  }

  private loadMediumData(selected_filter: string) {
    this.http.Get(`${urls.GET_UTM_MEDIUM_CHART}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.utmMediumsData = result;
      this.utmMediumsData.forEach((item: any) => {
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = false;
        item.valueLabel = 'Events';
      });
    });
  }

  private loadCampaignData(selected_filter: string) {
    this.http.Get(`${urls.GET_UTM_CAMPAIGN_CHART}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.utmCampaignsData = result;
      this.utmCampaignsData.forEach((item: any) => {
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = false;
        item.valueLabel = 'Events';
      });
    });
  }

  private loadTermData(selected_filter: string) {
    this.http.Get(`${urls.GET_UTM_TERM_CHART}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.utmTermsData = result;
      this.utmTermsData.forEach((item: any) => {
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = false;
        item.valueLabel = 'Events';
      });
    });
  }

  private loadContentData(selected_filter: string) {
    this.http.Get(`${urls.GET_UTM_CONTENT_CHART}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.utmContentData = result;
      this.utmContentData.forEach((item: any) => {
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = false;
        item.valueLabel = 'Events';
      });
    });
  }

}
