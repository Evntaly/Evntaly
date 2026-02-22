import { Component, OnInit } from '@angular/core';
import { InternalEventsService, urls } from '../../../core';
import { httpService } from '../../../core';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'dashboard-countries-analysis',
  templateUrl: './countries-analysis.component.html',
  styleUrls: ['./countries-analysis.component.css']
})
export class CountriesAnalysisComponent implements OnInit {
  selected_tab: string = 'countries';
  selected_filter: string = 'Last 7 Days';
  countriesData: any[] = [];
  citiesData: any[] = [];
  regionsData: any[] = [];

  constructor(private http: httpService, private eventService: InternalEventsService) {
    this.eventService.internalEvent$.subscribe((event: any) => {
      console.log('event', event, this.selected_tab);
      this.selected_filter = event;
      this.onTabSwitch(this.selected_tab);
    });
  }

  ngOnInit() {
    this.onTabSwitch('countries');
  }

  onTabSwitch(tabName: string) {
    this.selected_tab = tabName;

    switch(tabName) {
      case 'countries':
        this.loadCountriesData(this.selected_filter);
        break;
      case 'cities':
        this.loadCitiesData(this.selected_filter);
        break;
      case 'regions':
        this.loadRegionsData(this.selected_filter);
        break;
      default:
        console.warn('Unknown tab:', tabName);
    }
  }

  private loadCountriesData(selected_filter: string) {
    this.http.Get(`${urls.COUNTRIES_MAP_DATA_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.countriesData = result;
      this.countriesData.forEach((item: any) => {
        item.imageSrc = `https://flagsapi.com/${item.countryCode.toUpperCase()}/flat/64.png`;
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.isImageNonResolvable = item.countryCode.toLowerCase() == 'unknown';
      });
    });
  }

  private loadCitiesData(selected_filter: string) {
    this.http.Get(`${urls.CITIES_DATA_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.citiesData = result;
      this.citiesData.forEach((item: any) => {
        item.imageSrc = `https://flagsapi.com/${item.countryCode.toUpperCase()}/flat/64.png`;
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.name = `${item.name}`;
      });
    });
  }

  private loadRegionsData(selected_filter: string) {
    this.http.Get(`${urls.REGIONS_DATA_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.regionsData = result;
      this.regionsData.forEach((item: any) => {
        item.imageSrc = `https://flagsapi.com/${item.countryCode.toUpperCase()}/flat/64.png`;
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = true;
        item.valueLabel = 'Events';
        item.name = `${item.name}`;
      });
    });
  }

}
