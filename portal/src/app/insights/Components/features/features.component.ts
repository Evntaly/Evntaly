import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { feature } from '../../models/feature';
import { helpers, httpService, urls, SeoService } from '../../../core';
declare var NioApp: any;

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit, AfterViewChecked {
  columns = [
    {
      name: 'Feature',
      size: 'nk-tb-col'
    },
    {
      name: 'Adoption',
      size: 'nk-tb-col',
      sort_enabled: true,
      sort_field_name: 'adoption'
    },
    {
      name: 'Events',
      size: 'nk-tb-col tb-col-lg',
      sort_enabled: true,
      sort_field_name: 'total_events'
    },
    {
      name: 'Users',
      size: 'nk-tb-col tb-col-lg',
      sort_enabled: true,
      sort_field_name: 'unique_users_using_feature'
    },
    {
      name: 'Last seen active',
      size: 'nk-tb-col tb-col-md',
      sort_enabled: true,
      sort_field_name: 'last_seen_active'
    },
    {
      name: 'Registered',
      size: 'nk-tb-col tb-col-lg',
      sort_enabled: true,
      sort_field_name: 'registeration_date'
    },
  ];

  dates = [
    {text: 'Today' , is_active: true},
    {text: 'Yesterday' , is_active: false},
    {text: 'Last 7 days' , is_active: false},
    {text: 'Last 30 days' , is_active: false},
    {text: 'This week' , is_active: false},
    {text: 'This month' , is_active: false},
    // {text: 'Last month' , is_active: false},
    // {text: 'Last week' , is_active: false},
    {text: 'All time' , is_active: false},
  ];

  data: feature[] = [];
  selected_range: string = '';

  sorting : any = {
    sortBy: 'adoption',
    sortAs: 'desc'
  };

  pagination : any = {
    skip: 0,
    limit: 10
  };

  search_key: string = '';
  collectionSize: any;
  pageSize = 10;
  loading = true;

  constructor(private http: httpService, private seoService: SeoService) {
    this.seoService.setInsightsTitle('features');
  }

  ngAfterViewChecked(): void {
    NioApp.BS.progress('[data-progress]');
  }

  ngOnInit() {
    this.changeDateFilter('last 7 days');
  }

  getFeaturesList() {
    this.loading = true;
    this.http.Get(`${urls.LIST_FEATURES}/${this.selected_range}`, {...this.sorting, ...this.pagination, searchKey: this.search_key }).subscribe((result: any) => {
      this.data = result['data'];
      this.collectionSize = result['collectionSize'];

      this.data.forEach((feature) => {
        feature.last_seen_active_time_ago = this.timeAgo(feature.last_seen_active);
      })
      this.loading = false;
    })
  }

  changeDateFilter(selection: string){
    if(selection !== undefined){
      this.dates.forEach((item) => item.is_active = false);

      let selected = this.dates.find(x => x.text.toLowerCase() == selection.toLowerCase());
      selected!.is_active = true;
      this.selected_range = selected!.text;
      this.getFeaturesList();
    }
  };

  sortGrid(column: any){
    this.sorting['sortBy'] = column;
    this.sorting['sortAs'] = this.sorting['sortAs'] == 'desc' ? 'asc' : 'desc';
    this.getFeaturesList();
  };

  changeGridPage(pageInfo: any){
    this.pagination['skip'] = pageInfo['skip'];
    this.pagination['limit'] = pageInfo['limit'];

    this.getFeaturesList();
  };

  searchByFeatureName(e: any) {
    this.search_key = e.target.value;

    if(this.search_key == '') this.getFeaturesList();

    if (this.search_key.length > 3) {
      this.pagination['skip'] = 0;
      this.pagination['limit'] = 10;
      this.getFeaturesList();
    }
  }

  showFeature(feature: any) {
    window.open(`occurances/all?Feature=${feature}&Status=All`, '_blank');
  }

  getTimeAgoBGColor(lastSeen: any): string {
    return helpers.getTimeAgoBGColorForInsights(lastSeen);
  };

  getPerformanceBGColorAndText(performance: any) {
    return helpers.getInTableKPITextAndIcon(performance);
  };

  getFeatureAdoptionPerfomanceBGColorAndIcon(value: any) {
    return helpers.getRecordPerformanceColorAndIcon(value);
  };

  timeAgo(date: any){
    return helpers.timeAgo(date);
  };

  showDocs(){
    window.open('https://evntaly.gitbook.io/evntaly/features');
  }
}
