import { Component, OnInit } from '@angular/core';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit {
  columns = [
    {
      name: 'Title',
      size: 'nk-tb-col',
    },
    {
      name: 'Occurances',
      size: 'nk-tb-col',
      sort_enabled: true,
      sort_field_name: 'occurances',
    },
    {
      name: 'Sessions',
      size: 'nk-tb-col tb-col-md',
      sort_enabled: true,
      sort_field_name: 'sessions',
    },
    {
      name: 'Usage',
      size: 'nk-tb-col tb-col-md',
      sort_enabled: true,
      sort_field_name: 'users',
    },
    {
      name: 'last sent',
      size: 'nk-tb-col tb-col-md',
      sort_enabled: true,
      sort_field_name: 'updatedAt',
    },
    {
      name: 'Registered',
      size: 'nk-tb-col tb-col-lg',
      sort_enabled: true,
      sort_field_name: 'createdAt',
    },
    {
      name: 'Actions',
      size: 'nk-tb-col text-end',
      sort_enabled: false,
      sort_field_name: '',
    },
  ];

  dates = [
    { text: 'Today', is_active: true },
    { text: 'Yesterday', is_active: false },
    { text: 'Last 7 days', is_active: false },
    { text: 'Last 30 days', is_active: false },
    { text: 'This week', is_active: false },
    { text: 'This month', is_active: false },
    // {text: 'Last month' , is_active: false},
    // {text: 'Last week' , is_active: false},
    { text: 'All time', is_active: false },
  ];

  data: any[] = [];
  selected_range: string = '';

  sorting: any = {
    sortBy: 'updatedAt',
    sortAs: 'desc',
  };

  pagination: any = {
    skip: 0,
    limit: 10,
  };

  search_key: string = '';
  collectionSize: any;
  pageSize = 10;
  loading = false;

  constructor(private http: httpService, private router: Router, private seoService: SeoService) {
    this.seoService.setInsightsTitle('events');
  }

  ngOnInit() {
    this.changeDateFilter('last 7 days');
  }

  getEventsList() {
    this.loading = true;
    this.http
      .Get(`${urls.LIST_PARENT_EVENTS}/${this.selected_range}`, {
        ...this.sorting,
        ...this.pagination,
        searchKey: this.search_key,
      })
      .subscribe((result: any) => {
        this.data = result['data'];
        this.collectionSize = result['collectionSize'];

        this.data.forEach((event) => {
          event.last_sent_time_ago = helpers.timeAgo(event.last_sent);
        });
        this.loading = false;
      });
  }

  showOccurances(title: any) {
    window.open(`occurances/all?Name+Or+Description=${title}&Status=All`, '_blank');
  }

  searchByEventName(e: any) {
    this.search_key = e.target.value;

    if (this.search_key == '') this.getEventsList();

    if (this.search_key.length > 3) {
      this.pagination['skip'] = 0;
      this.pagination['limit'] = 10;
      this.getEventsList();
    }
  }

  changeDateFilter(selection: string) {
    if (selection !== undefined) {
      this.dates.forEach((item) => (item.is_active = false));

      let selected = this.dates.find(
        (x) => x.text.toLowerCase() == selection.toLowerCase()
      );
      selected!.is_active = true;
      this.selected_range = selected!.text;
      this.getEventsList();
    }
  }

  sortGrid(column: any) {
    this.sorting['sortBy'] = column;
    this.sorting['sortAs'] = this.sorting['sortAs'] == 'desc' ? 'asc' : 'desc';
    this.getEventsList();
  }

  changeGridPage(pageInfo: any) {
    this.pagination['skip'] = pageInfo['skip'];
    this.pagination['limit'] = pageInfo['limit'];

    this.getEventsList();
  }

  getTimeAgoBGColor(lastSeen: any): string {
    return helpers.getTimeAgoBGColorForInsights(lastSeen);
  }

  viewParentEventDetails(id: any) {
    this.router.navigate(['insights/event-details', id]);
  }

  showDocs(){
    window.open('https://evntaly.gitbook.io/evntaly/events');
  }
}
