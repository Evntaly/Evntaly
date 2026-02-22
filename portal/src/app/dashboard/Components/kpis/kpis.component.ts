import { Component, OnInit } from '@angular/core';
import { httpService, urls } from '../../../core';

@Component({
  selector: 'dashboard-kpis',
  templateUrl: './kpis.component.html',
  styleUrls: ['./kpis.component.css'],
})
export class KpisComponent implements OnInit {
  total_users = 0;
  new_users = 0;
  active_users = 0;
  active_users_period_text: any = 'DAU';
  drop_off_rate = 0;

  new_users_filter = [
    { text: 'Today', is_active: true },
    { text: 'Yesterday', is_active: false },
    { text: 'Last 7 Days', is_active: false },
    { text: 'Last 30 Days', is_active: false },
    { text: 'Last 3 Months', is_active: false },
    { text: 'All Time', is_active: false },
  ];

  active_users_filter = [
    { text: 'Today', graph_text: 'DAU', is_active: true },
    { text: 'This Week' , graph_text: 'WAU', is_active: false },
    { text: 'This Month', graph_text: 'MAU', is_active: false },
  ];

  constructor(private http: httpService) {}

  ngOnInit() {
    this.getTotalUsersKPI();
    this.changeNewUsersFilter('Today');
    this.changeActiveUsersFilter('Today');
    this.getDropOffRateKPI();
  }

  getTotalUsersKPI() {
    this.http
      .Get(`${urls.GET_ALL_USERS_KPI}/all time`, null)
      .subscribe((result: any) => {
        this.total_users = result['total_users'];
      });
  }

  getNewUsersKPI(dateRange: any) {
    this.http
      .Get(`${urls.GET_NEW_USERS_KPI}/${dateRange}`, null)
      .subscribe((result: any) => {
        this.new_users = result['total_users'];
      });
  }

  getActiveUsersKPI(dateRange: any) {
    this.http
    .Get(`${urls.GET_ACTIVE_USERS_KPI}/${dateRange}`, null)
    .subscribe((result: any) => {
      this.active_users = result['active_users'];
    });
  }

  getDropOffRateKPI() {
    this.http
    .Get(`${urls.GET_DROP_OFF_RATE}`, null)
    .subscribe((result: any) => {
      this.drop_off_rate = result['drop_off_rate'].toFixed(2);
    });
  }


  changeNewUsersFilter(selection: string){
    this.new_users_filter.forEach((item) => item.is_active = false);

    let selected = this.new_users_filter.find(x => x.text.toLowerCase() == selection.toLowerCase());
    selected!.is_active = true;
    this.getNewUsersKPI(selected?.text);
  };

  changeActiveUsersFilter(selection: string){
    this.active_users_filter.forEach((item) => item.is_active = false);

    let selected = this.active_users_filter.find(x => x.text.toLowerCase() == selection.toLowerCase());
    selected!.is_active = true;
    this.active_users_period_text = selected?.graph_text;
    this.getActiveUsersKPI(selected?.text);
  };
}
