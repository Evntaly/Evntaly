import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { httpService, InternalEventsService, urls } from '../../../core';

@Component({
  selector: 'app-kpis-v2',
  templateUrl: './kpis-v2.component.html',
  styleUrls: ['./kpis-v2.component.css']
})
export class KpisV2Component implements OnInit, OnDestroy {
  total_users = 0;
  new_users = 0;
  new_users_percentage_change = 0;
  active_users = 0;
  active_users_period_text: any = 'DAU';
  drop_off_rate = 0;
  sessions = 0;
  page_views = 0;
  sessions_percentage_change = 0;
  page_views_percentage_change = 0;
  active_users_percentage_change = 0;
  online_users = 0;
  onlineUsersChartOption: any;
  onlineUsersInterval: any;
  onlineUsersLoading = true;

  @Output() kpiVisibilityChange = new EventEmitter<{ [key: string]: boolean }>();

  kpiVisibility: { [key: string]: boolean } = {
    'Users': true,
    'Active Users': true,
    'Sessions': false,
    'Page Views': false
  };

  constructor(private http: httpService, private eventService: InternalEventsService) {
    this.eventService.internalEvent$.subscribe((event: any) => {
      console.log(event);
      this.getNewUsersKPI(event);
      this.getActiveUsersKPI(event);
      this.getSessionsKPI(event);
      this.getPageViewsKPI(event);
    });
  }

  ngOnInit() {
    this.getTotalUsersKPI();
    this.getDropOffRateKPI();
    this.getNewUsersKPI('Last 7 Days');
    this.getActiveUsersKPI('Last 7 Days');
    this.getSessionsKPI('Last 7 Days');
    this.getPageViewsKPI('Last 7 Days');
    this.getOnlineUsersKPI();

    this.onlineUsersInterval = setInterval(() => {
      this.getOnlineUsersKPI();
    }, 5 * 60 * 1000); // 5 minutes
  }

  ngOnDestroy() {
    if (this.onlineUsersInterval) {
      clearInterval(this.onlineUsersInterval);
    }
  }

  getOnlineUsersKPI() {
    this.onlineUsersLoading = true;
    const startTime = Date.now();
    const minLoadingTime = 1000; // 2 seconds minimum loading time

    this.http.Get(urls.GET_ONLINE_USERS_KPI, null).subscribe((result: any) => {
      this.online_users = result.online_users;

      const data = result.history || [];

      const nonZeroValues = data.filter((val: number) => val > 0);
      const maxActualValue = nonZeroValues.length > 0 ? Math.max(...nonZeroValues) : 1;

      const zeroBarHeight = maxActualValue * 0.08;

      const paddedData = [];
      for (let i = 0; i < 12; i++) {
        const actualValue = data[i] !== undefined ? data[i] : 0;
        const displayValue = actualValue === 0 ? zeroBarHeight : actualValue;
        paddedData.push({
          value: displayValue,
          itemStyle: {
            color: actualValue === 0 ? '#e5e7eb' : '#22c55e' // Light gray for zero values
          }
        });
      }

      const labels = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        let hour = d.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        labels.push(`${hour} ${ampm}`);
      }

      this.onlineUsersChartOption = {
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const param = params[0];
            // Show 0 in tooltip if the actual value was 0
            const actualValue = data[param.dataIndex] !== undefined ? data[param.dataIndex] : 0;
            const displayValue = actualValue === 0 ? 0 : param.value;
            return `${param.name}: ${displayValue}`;
          },
          axisPointer: { type: 'none' }
        },
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        xAxis: {
          type: 'category',
          show: false,
          data: labels
        },
        yAxis: {
          type: 'value',
          show: false,
          min: 0,
          max: (() => {
            const maxValue = Math.max(...paddedData.map((item: any) => item.value));
            // If all values are 0, set max to show the zero bars properly
            if (maxValue <= zeroBarHeight) {
              return zeroBarHeight * 1.5; // Show zero bars when all values are zero
            }
            return maxValue * 1.1; // Add 10% padding for non-zero values
          })()
        },
        series: [
          {
            data: paddedData,
            type: 'bar',
            barWidth: '50%',
            itemStyle: {
              borderRadius: [2, 2, 0, 0]
            },
            emphasis: {
              itemStyle: {
                color: (params: any) => {
                  const actualValue = data[params.dataIndex] !== undefined ? data[params.dataIndex] : 0;
                  return actualValue === 0 ? '#d1d5db' : '#15803d'; // Slightly darker gray on hover
                }
              }
            }
          }
        ]
      };

      // Ensure skeleton shows for at least 2 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        this.onlineUsersLoading = false;
      }, remainingTime);
    }, (error) => {
      // On error, also ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        this.onlineUsersLoading = false;
      }, remainingTime);
    });
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
        this.new_users_percentage_change = result['percentage_change'];
      });
  }

  getActiveUsersKPI(dateRange: any) {
    this.http
    .Get(`${urls.GET_ACTIVE_USERS_KPI}/${dateRange}`, null)
    .subscribe((result: any) => {
      this.active_users = result['active_users'];
      this.active_users_percentage_change = result['percentage_change'];
    });
  }

  getDropOffRateKPI() {
    this.http
    .Get(`${urls.GET_DROP_OFF_RATE}`, null)
    .subscribe((result: any) => {
      this.drop_off_rate = result['drop_off_rate'].toFixed(2);
    });
  }

  getSessionsKPI(dateRange: any) {
    this.http
    .Get(`${urls.GET_SESSIONS_KPI}/${dateRange}`, null)
    .subscribe((result: any) => {
      console.log(result);
      this.sessions = result['total_sessions'];
      this.sessions_percentage_change = result['percentage_change'];
    });
  }

  getPageViewsKPI(dateRange: any) {
    this.http
    .Get(`${urls.GET_PAGE_VIEWS_KPI}/${dateRange}`, null)
    .subscribe((result: any) => {
      this.page_views = result['total_page_views'];
      this.page_views_percentage_change = result['percentage_change'];
    });
  }

  onCheckboxChange(kpi: string, event: any) {
    this.kpiVisibility[kpi] = event.target.checked;
    this.kpiVisibilityChange.emit({ ...this.kpiVisibility });
  }
}
