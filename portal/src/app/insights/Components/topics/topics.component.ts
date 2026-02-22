import { Component, OnInit } from '@angular/core';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { topic } from '../../models/topic';
declare var NioApp: any;

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.css']
})
export class TopicsComponent implements OnInit {
  columns = [
    {
      name: 'Topic',
      size: 'nk-tb-col'
    },
    {
      name: 'Events',
      size: 'nk-tb-col',
      sort_enabled: true,
      sort_field_name: 'total_events'
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

  data: topic[] = []

  selected_range: string = '';

  sorting : any = {
    sortBy: 'total_events',
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
    this.seoService.setInsightsTitle('topics');
  }

  ngAfterViewChecked(): void {
    NioApp.BS.progress('[data-progress]');
  }

  ngOnInit() {
    this.changeDateFilter('last 7 days');
  }

  getTopicsList() {
    this.loading = true;
    this.http.Get(`${urls.LIST_TOPICS}/${this.selected_range}`, {...this.sorting, ...this.pagination, searchKey: this.search_key }).subscribe((result: any) => {
      this.data = result['data'];
      this.collectionSize = result['collectionSize'];

      this.data.forEach((feature) => {
        feature.last_seen_active_time_ago = this.timeAgo(feature.last_seen_active);
      })
      this.loading = false;
    })
  }


  searchByTopicName(e: any){
    this.search_key = e.target.value;

    if(this.search_key == '') this.getTopicsList();

    if (this.search_key.length > 3) {
      this.pagination['skip'] = 0;
      this.pagination['limit'] = 10;
      this.getTopicsList();
    }
  }

  changeDateFilter(selection: string){
    if(selection !== undefined){
      this.dates.forEach((item) => item.is_active = false);

      let selected = this.dates.find(x => x.text.toLowerCase() == selection.toLowerCase());
      selected!.is_active = true;
      this.selected_range = selected!.text;
      this.getTopicsList();
    }
  };


  sortGrid(column: any){
    this.sorting['sortBy'] = column;
    this.sorting['sortAs'] = this.sorting['sortAs'] == 'desc' ? 'asc' : 'desc';
    this.getTopicsList();
  };

  changeGridPage(pageInfo: any){
    this.pagination['skip'] = pageInfo['skip'];
    this.pagination['limit'] = pageInfo['limit'];

    this.getTopicsList();
  };

  showTopic(topic: any) {
    window.open(`occurances/all?Topic=${topic}&Status=All`, '_blank');
  }

  getTopicEventsPerfomanceBGColorAndIcon(value: any) {
    return helpers.getRecordPerformanceColorAndIcon(value);
  };

  getPerformanceBGColorAndText(performance: any) {
    return helpers.getInTableKPITextAndIcon(performance);
  };

  getTimeAgoBGColor(lastSeen: any): string {
    return helpers.getTimeAgoBGColorForInsights(lastSeen);
  };

  timeAgo(date: any){
    return helpers.timeAgo(date);
  };

  showDocs(){
    window.open('https://evntaly.gitbook.io/evntaly/topics');
  }
}
