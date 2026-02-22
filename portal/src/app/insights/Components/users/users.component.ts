import { Component, OnInit } from '@angular/core';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { EChartsOption, helper } from 'echarts';
import { user } from '../../models/user';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
declare var NioApp: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  columns = [
    {
      name: 'ID',
      size: 'nk-tb-col'
    },
    {
      name: 'Full Name',
      size: 'nk-tb-col',
      sort_enabled: false,
      sort_field_name: 'full_name'
    },
    {
      name: 'Email',
      size: 'nk-tb-col tb-col-lg',
      sort_enabled: false,
      sort_field_name: 'email'
    },
    {
      name: 'Company',
      size: 'nk-tb-col tb-col-lg',
      sort_enabled: true,
      sort_field_name: 'organization'
    },
    {
      name: 'Events',
      size: 'nk-tb-col tb-col-md',
      sort_enabled: true,
      sort_field_name: 'total_number_of_events'
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
      sort_field_name: 'createdAt'
    },
    {
      name: 'Actions',
      size: 'nk-tb-col text-end',
      sort_enabled: false,
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

  data: user[] = []

  selected_range: string = '';

  sorting : any = {
    sortBy: 'last_seen_active',
    sortAs: 'desc'
  };

  pagination : any = {
    skip: 0,
    limit: 10
  };

  search_key: string = '';
  collectionSize: any;
  pageSize = 10;
  loading = false;

  options: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        label: {
          backgroundColor: '#616161',
        },
      },
      backgroundColor: '#616161',
      borderColor: '#616161',
      textStyle: {
        color: 'white',
      },
      formatter: (params: any) => {
        return `${params[0].axisValueLabel}: ${params[0].data['value']} Users`;
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '3%',
      top: '1%',
      containLabel: true,
      show: false,
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        color: '#6783b8',
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
    },
    legend: {
      show: false,
    },
  };

  active_users_merge_options: EChartsOption = {};
  active_users_today: number = 0;
  variance_in_active_users: number = 0;
  change_in_active_users: number = 0;

  registered_users_merge_options: EChartsOption = {};
  registered_users_today: number = 0;
  variance_in_registered_users: number = 0;
  change_in_registered_users: number = 0;

  constructor(
    private http: httpService,
    private router: Router,
    private clipboard: Clipboard,
    private seoService: SeoService
  ) {
    this.seoService.setInsightsTitle('users');
  }

  ngOnInit() {
    this.changeDateFilter('last 7 days');
    this.getActiveUsersGraphData();
    this.getRegisteredUsersGraphData();
    this.getListOfUsers();
  }

  getActiveUsersGraphData(){
    this.http.Get(`${urls.ACTIVE_USERS_CHART}/${this.selected_range}`, null).subscribe((response: any) => {
      this.active_users_today = response.kpi || 0;
      this.variance_in_active_users = Math.abs(response.variance);
      this.change_in_active_users = response.variance;

      const map = new Map();
      const days = helpers.getRangeOfDates(7);
      const result = response.data as any[];

      result.forEach((item: any) => {
        item['date'] = new Date(item['_id']).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        }).slice(0, -3).replace(/\//g, '-');
      })

      days.forEach((day: any) => {
        let record = result.find((x: any) => x.date == day);
        if(!record) map.set(day, 0);
        else map.set(day, record.count);
      });


      const data = Array.from(map, ([key, value]) => ({ key, value }));
      const labels = data.map(item => item.key);

      this.active_users_merge_options = {
        series: [
          {
            type: 'bar',
            stack: 'counts',
            data: data,
            barWidth: '40%',
            barGap: '20%',
            itemStyle: {
              color: '#020B73',
            },
            emphasis: {
              focus: 'series',
            },
          }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: labels,
          },
        ],
        yAxis: [
          {
            minInterval: 1
          }
        ]
      }
    })
  }

  getRegisteredUsersGraphData(){
    this.http.Get(`${urls.REGISTERED_USERS_CHART}/${this.selected_range}`, null).subscribe((response: any) => {
      this.registered_users_today = response.kpi || 0;
      this.variance_in_registered_users = Math.abs(response.variance);
      this.change_in_registered_users = response.variance;

      const map = new Map();
      const days = helpers.getRangeOfDates(7);
      const result = response.data as any[];

      result.forEach((item: any) => {
        item['date'] = new Date(item['_id']).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        }).slice(0, -3).replace(/\//g, '-');
      })

      days.forEach((day: any) => {
        let record = result.find((x: any) => x.date == day);
        if(!record) map.set(day, 0);
        else map.set(day, record.count);
      });


      const data = Array.from(map, ([key, value]) => ({ key, value }));
      const labels = data.map(item => item.key);

      this.registered_users_merge_options = {
        series: [
          {
            type: 'bar',
            stack: 'counts',
            data: data,
            barWidth: '40%',
            barGap: '20%',
            itemStyle: {
              color: '#020B73',
            },
            emphasis: {
              focus: 'series',
            },
          }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: labels,
          },
        ],
        yAxis: [
          {
            minInterval: 1
          }
        ]
      }
    })
  }

  getListOfUsers(){
    this.loading = true;
    this.http.Get(`${urls.GET_USERS_LIST}/${this.selected_range}` , {...this.sorting, ...this.pagination, searchKey: this.search_key }).subscribe((result: any) =>{
      result.data.forEach((user: user) => {
        user.last_seen_active_time_ago = helpers.timeAgo(user.last_seen_active);
        user.name_init = this.getInitials(user.full_name);
        user.avatar_cover = this.getBgClassForName(user.full_name);
      });
      this.data = result.data;
      this.collectionSize = result.total_count;
      this.loading = false;
    })
  }

  searchByUsers(e: any) {
    this.search_key = e.target.value;

    if (this.search_key == '') this.getListOfUsers();

    if (this.search_key.length > 3) {
      this.pagination['skip'] = 0;
      this.pagination['limit'] = 10;
      this.getListOfUsers();
    }
  }

  changeDateFilter(selection: string){
    if(selection !== undefined){
      this.dates.forEach((item) => item.is_active = false);

      let selected = this.dates.find(x => x.text.toLowerCase() == selection.toLowerCase());
      selected!.is_active = true;
      this.selected_range = selected!.text;
      // this.getTopicsList();
    }
  };

  getBgClassForName(name: any) {
    const initials = this.getInitials(name);
    const firstInitial = initials[0];
    return helpers.getColorForInitial(firstInitial);
  };



  getInitials(name: any) {
    return helpers.getInitials(name);
  };

  changeGridPage(pageInfo: any){
    this.pagination['skip'] = pageInfo['skip'];
    this.pagination['limit'] = pageInfo['limit'];

    this.getListOfUsers();
  };

  getTimeAgoBGColor(lastSeen: any): string {
    return helpers.getTimeAgoBGColorForInsights(lastSeen);
  };

  sortGrid(column: any){
    this.sorting['sortBy'] = column;
    this.sorting['sortAs'] = this.sorting['sortAs'] == 'desc' ? 'asc' : 'desc';
    this.getListOfUsers();
  };

  viewUserDetails(id: any){
    this.router.navigate(['insights/user-details', id]);
  }

  showDocs(){
    window.open('https://evntaly.gitbook.io/evntaly/users');
  }

  copyToClipboard(info: any) {
    this.clipboard.copy(JSON.stringify(info));
    NioApp.Toast('<h5>Copied</h5>', 'info', { position: 'bottom-left' });
  }

  showOccurances(user_email: any) {
    window.open(`occurances/all?User=${user_email}&Status=All&Range=All+time`, '_blank');
  }
}
