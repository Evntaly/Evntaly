import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { helpers, httpService, InternalEventsService, urls } from '../../../core';
import { firstValueFrom, map, Observable } from 'rxjs';

@Component({
  selector: 'dashboard-user-behaviour',
  templateUrl: './user-behaviour.component.html',
  styleUrls: ['./user-behaviour.component.css']
})
export class UserBehaviourComponent implements OnInit, OnChanges {
  selected_filter: any = 'Last 7 Days';
  filters: any = [
    { text: 'Today', value: 1,  is_active: true },
    { text: 'Last 7 Days', value: 7,  is_active: true },
    { text: 'Last 10 Days', value: 10,  is_active: false},
    { text: 'Last 30 Days',  value: 30,  is_active: false},
    {text: 'This week' , is_active: false, value: -7},
    {text: 'This month' , is_active: false, value: -30},
  ];

  @Input() seriesVisibility: { [key: string]: boolean } = {
    'Users': true,
    'Active Users': true,
    'Sessions': false,
    'Page Views': false
  };

  chartOptions: any;
  mergeChartOptions: any;
  new_users: any;
  active_users: any;

  series: any[] = [];

  constructor(private http: httpService, private eventService: InternalEventsService) {
    this.eventService.internalEvent$.subscribe((event: any) => {
      this.changeFilter(event);
      this.selected_filter = event;
    });
  }

  ngOnInit() {
    this.changeFilter('Last 7 Days');
    this.chartOptions = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        show: true,
        orient: 'horizontal',
        top: '5%',
        left: 'center',
        icon: 'circle',
        itemWidth: 15,
        itemHeight: 15,
        textStyle: {
          color: '#6783b8',
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          color: '#6783b8',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        interval: 1,
        axisLabel: {
          formatter: '{value}',
          color: '#6783b8',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      animation: true,
      animationDuration: 1000
    };
  }

  chartInstance: any;

  onChartInit(ec: any) {
    this.chartInstance = ec;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seriesVisibility'] && !changes['seriesVisibility'].firstChange) {
      this.changeFilter(this.selected_filter);
    }
  }

  updateChartOptions(new_users: any, active_users: any, session_count: any, page_views: any, days: string[], maxValue: number) {
    this.series = [
      {
        name: 'Users',
        type: 'line',
        visible: true,
        data: new_users,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#000B73',
          width: 3,
        },
        itemStyle: {
          color: '#000B73',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(0, 11, 115, 0.3)'
            }, {
              offset: 1, color: 'rgba(0, 11, 115, 0.05)'
            }]
          }
        }
      },
      {
        name: 'Active Users',
        type: 'line',
        visible: true,
        data: active_users,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#21C55D',
          width: 3,
        },
        itemStyle: {
          color: '#21C55D',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(33, 197, 93, 0.3)'
            }, {
              offset: 1, color: 'rgba(33, 197, 93, 0.05)'
            }]
          }
        }
      },
      {
        name: 'Sessions',
        type: 'line',
        visible: true,
        data: session_count,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#F59E0B',
          width: 3,
        },
        itemStyle: {
          color: '#F59E0B',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(245, 158, 11, 0.3)'
            }, {
              offset: 1, color: 'rgba(245, 158, 11, 0.05)'
            }]
          }
        }
      },
      {
        name: 'Page Views',
        type: 'line',
        visible: true,
        data: page_views,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#f2426e',
          width: 3,
        },
        itemStyle: {
          color: '#f2426e',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(242, 66, 110, 0.3)'
            }, {
              offset: 1, color: 'rgba(242, 66, 110, 0.05)'
            }]
          }
        }
      },
    ]

    if (this.chartInstance) {
      this.chartInstance.clear();
    }

    this.mergeChartOptions.series = this.series.filter(s => this.seriesVisibility[s.name]);
  }


  async changeFilter(selection: string){
    let selected = this.filters.find((x: any) => x.text.toLowerCase() == selection.toLowerCase());
    const days = helpers.getRangeOfDates2(selected?.value);
    console.log(days);

    const new_users = await this.getNewUsersGraphData(selected?.text, days);
    const active_users = await this.getActiveUsersGraphData(selected?.text, days);
    const session_count = await this.getSessionCountGraphData(selected?.text, days);
    const page_views = await this.getPageViewsGraphData(selected?.text, days);

    // Calculate max value from both datasets
    const maxValue = Math.max(
      ...new_users,
      ...active_users,
      ...session_count,
      ...page_views
    );

    this.mergeChartOptions = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        formatter: function (params: any) {
          let tooltipText = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
          params.forEach((param: any) => {
            tooltipText += `<div style="display: flex; align-items: center; margin-bottom: 3px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
              <span style="flex: 1;">${param.seriesName}:</span>
              <span style="font-weight: bold; margin-left: 10px;">${param.value}</span>
            </div>`;
          });
          return tooltipText;
        }
      },
      legend: {
        show: true,
        orient: 'horizontal',
        top: '5%',
        left: 'center',
        icon: 'circle',
        itemWidth: 15,
        itemHeight: 15,
        textStyle: {
          color: '#6783b8',
        },
      },
      xAxis: {
        type: 'category',
        data: days,
        boundaryGap: false,
        axisLabel: {
          color: '#6783b8',
          fontSize: 12,
          rotate: 0
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        interval: helpers.calculateDynamicInterval(maxValue),
        axisLabel: {
          formatter: '{value}',
          color: '#6783b8',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      animation: true,
      animationDuration: 1000,
    }

    this.updateChartOptions(new_users, active_users, session_count, page_views, days, maxValue);
  };


  getNewUsersGraphData(dateRange: string,timePeriod: string[]): Promise<any> {
    return firstValueFrom(
      this.http.Get(`${urls.REGISTERED_USERS_CHART_DASHBOARD}/${dateRange}`, null).pipe(
        map((result: any) => {
          const chartQueryData: any[] = result['data'] as any[];
          return this.prepareChartSeriesData(chartQueryData, timePeriod, this.selected_filter == 'Today');
        })
      )
    );
  }

  getActiveUsersGraphData(dateRange: string,timePeriod: string[]): Promise<any> {
    return firstValueFrom(
      this.http.Get(`${urls.ACTIVE_USERS_CHART_DASHBOARD}/${dateRange}`, null).pipe(
        map((result: any) => {
          const chartQueryData: any[] = result['data'] as any[];
          return this.prepareChartSeriesData(chartQueryData, timePeriod, this.selected_filter == 'Today');
        })
      )
    );
  }

  getSessionCountGraphData(dateRange: string,timePeriod: string[]): Promise<any> {
    return firstValueFrom(
      this.http.Get(`${urls.SESSIONS_COUNT_CHART_DASHBOARD}/${dateRange}`, null).pipe(
        map((result: any) => {
          const chartQueryData: any[] = result['data'] as any[];
          return this.prepareChartSeriesData(chartQueryData, timePeriod, this.selected_filter == 'Today');
        })
      )
    );
  }

  getPageViewsGraphData(dateRange: string,timePeriod: string[]): Promise<any> {
    return firstValueFrom(
      this.http.Get(`${urls.PAGE_VIEWS_CHART_DASHBOARD}/${dateRange}`, null).pipe(
        map((result: any) => {
          const chartQueryData: any[] = result['data'] as any[];
          return this.prepareChartSeriesData(chartQueryData, timePeriod, this.selected_filter == 'Today');
        })
      )
    );
  }

  prepareChartSeriesData(chartQueryResult: any[], days: string[], is_hours: boolean = false){
    var aggregations: any[] = [];
    var chart: number[] = [];


    chartQueryResult.forEach((item: any) => {
      item['date'] = is_hours ?
        new Date(item['_id']).getHours().toString().padStart(2, '0') :
        new Date(item['_id']).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        }).slice(0, -3).replace(/\//g, '-');

      if (is_hours) {
        item['date'] = item['hour'];
      } else {
        item['date'] = item['date'];
      }

      if (aggregations[item['date']]) {
        aggregations[item['date']].count += item.count;
      } else {
        aggregations[item['date']] = {
          date: item.date,
          count: item.count,
        };
      }
    });


    var t = Object.values(aggregations);

    days.forEach((day) => {
      var result = t.find(x => x.date == day);
      chart.push(result == undefined ? 0 : result['count']);
    });

    return chart;
  }

}
