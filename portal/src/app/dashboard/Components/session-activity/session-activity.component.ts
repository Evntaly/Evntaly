import { Component, OnInit } from '@angular/core';
import { helpers, httpService, urls } from '../../../core';
import { firstValueFrom, map } from 'rxjs';
import * as echarts from 'echarts';
import worldGeoJSON from '../../../../assets/js/world.json'

@Component({
  selector: 'dashboard-session-activity',
  templateUrl: './session-activity.component.html',
  styleUrls: ['./session-activity.component.css'],
})
export class SessionActivityComponent implements OnInit {
  selected_filter: any = '';
  filters: any = [
    { text: '7 Days', value: 7,  is_active: true },
    { text: '10 Days', value: 10,  is_active: false},
    { text: '30 Days',  value: 30,  is_active: false},
  ];
  countriesData: any[] = [
    { name: 'United States', value: 500000, imageSrc: 'https://flagsapi.com/US/flat/64.png', color: '#000B73', percentage: 100, barColor: '#000B73' , isImage: true},
    { name: 'Germany', value: 300000, imageSrc: 'https://flagsapi.com/DE/flat/64.png', color: '#000B73', percentage: 100, barColor: '#000B73' , isImage: true},
    { name: 'China', value: 900000, imageSrc: 'https://flagsapi.com/CN/flat/64.png', color: '#000B73', percentage: 100, barColor: '#000B73' , isImage: true},
    { name: 'Egypt', value: 250000, imageSrc: 'https://flagsapi.com/EG/flat/64.png', color: '#000B73', percentage: 100, barColor: '#000B73' , isImage: true},
    { name: 'Saudi Arabia', value: 250000, imageSrc: 'https://flagsapi.com/SA/flat/64.png', color: '#000B73', percentage: 100, barColor: '#000B73' , isImage: true},
    { name: 'United Kingdom', value: 250000, imageSrc: 'https://flagsapi.com/GB/flat/64.png', color: '#000B73', percentage: 100, barColor: '#000B73' , isImage: true},
    { name: 'France', value: 2250000, imageSrc: 'https://flagsapi.com/FR/flat/64.png', color: '#000B73', percentage: 100, barColor: '#000B73' , isImage: true},
  ];

  chartOptions: any;
  mergeChartOptions: any;

  constructor(private http: httpService) {}

  ngOnInit() {
    // Register the world map with ECharts before using it
    echarts.registerMap('world', worldGeoJSON as any);

    this.changeFilter('7 days');
    this.chartOptions = {
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          if (params.value) {
            return `<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
                    <div style="color: #8091a7; font-size: 12px;">${params.value.toLocaleString()} events</div>`;
          }
          return `<div style="color: #8091a7;">${params.name}</div><div style="font-size: 11px; color: #b7c2d0;">No data available</div>`;
        },
        backgroundColor: '#ffffff',
        borderColor: '#e5e9f2',
        borderWidth: 1,
        padding: [10, 12],
        borderRadius: 6,
        shadowBlur: 8,
        shadowColor: 'rgba(43, 55, 72, 0.15)',
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        textStyle: {
          color: '#364a63',
          fontSize: 13,
          fontFamily: 'Roboto, sans-serif'
        }
      },
      visualMap: {
        min: 0,
        max: 1000000,
        show: false,
        inRange: {
          color: ['#e0ffff', '#000B73'],
        },
      },
      grid: {
        containLabel: true,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      series: [
        {
          name: 'Event Count',
          type: 'map',
          map: 'world',
          roam: true,
          scaleLimit: {
            min: 2,
            max: 10
          },
                      zoom: 2,
            center: [0, -20],
            emphasis: {
              itemStyle: {
                areaColor: '#EEEEEE',
                // borderColor: '#000B73',
                borderWidth: 1,
              },
              label: {
                show: false
              }
            },
          data: [
            // { name: 'United States', value: 500000 },
            // { name: 'Germany', value: 300000 },
            // { name: 'China', value: 900000 },
            // { name: 'Egypt', value: 250000 },
            // { name: 'Saudi Arabia', value: 250000 },
            // { name: 'United Kingdom', value: 250000 },
            // { name: 'France', value: 2250000 },
            // { name: 'Italy', value: 250000 },
            // { name: 'Spain', value: 250000 },
            // { name: 'Portugal', value: 250000 },
            // { name: 'Greece', value: 250000 },
          ],
        },
      ],
    };
  }

  async changeFilter(selection: string){
    this.filters.forEach((item: any) => item.is_active = false);

    let selected = this.filters.find((x: any) => x.text.toLowerCase() == selection.toLowerCase());
    selected!.is_active = true;
    this.selected_filter = selected?.text;
    const days = helpers.getRangeOfDates(selected?.value);
    const sessions_count = await this.getSessionsCount(days);

    // Calculate max value for dynamic interval
    const maxValue = Math.max(...sessions_count);

    // this.mergeChartOptions = {
    //   title: {
    //     text: 'World Event Distribution',
    //     left: 'center',
    //   },
    //   tooltip: {
    //     trigger: 'item',
    //     formatter: function(params: any) {
    //       if (params.value) {
    //         return `<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
    //                 <div style="color: #8091a7; font-size: 12px;">${params.value.toLocaleString()} events</div>`;
    //       }
    //       return `<div style="color: #8091a7;">${params.name}</div><div style="font-size: 11px; color: #b7c2d0;">No data available</div>`;
    //     },
    //     backgroundColor: '#ffffff',
    //     borderColor: '#e5e9f2',
    //     borderWidth: 1,
    //     padding: [10, 12],
    //     borderRadius: 6,
    //     shadowBlur: 8,
    //     shadowColor: 'rgba(43, 55, 72, 0.15)',
    //     shadowOffsetX: 0,
    //     shadowOffsetY: 2,
    //     textStyle: {
    //       color: '#364a63',
    //       fontSize: 13,
    //       fontFamily: 'Roboto, sans-serif'
    //     }
    //   },
    //   visualMap: {
    //     min: 0,
    //     max: 1000000,
    //     show: false,
    //     inRange: {
    //       color: ['#000B73', '#000B73'],
    //     },
    //   },
    //   grid: {
    //     containLabel: true,
    //     left: 0,
    //     right: 0,
    //     top: 0,
    //     bottom: 0
    //   },
    //   series: [
    //     {
    //       name: 'Event Count',
    //       type: 'map',
    //       map: 'world',
    //       roam: true,
    //       scaleLimit: {
    //         min: 0.5,
    //         max: 5
    //       },
    //                   zoom: 2,
    //         center: [0, -20],
    //         emphasis: {
    //           label: { show: false },
    //         },
    //       data: [
    //         { name: 'United States', value: 500000 },
    //         { name: 'Germany', value: 300000 },
    //         { name: 'China', value: 900000 },
    //         { name: 'Egypt', value: 250000 },
    //       ],
    //     },
    //   ],
    // };
  };

  getSessionsCount(timePeriod: string[]): Promise<any> {
    return firstValueFrom(
      this.http.Get(`${urls.SESSIONS_COUNT_CHART_DASHBOARD}/all time`, null).pipe(
        map((result: any) => {
          const chartQueryData: any[] = result as any[];
          return this.prepareChartSeriesData(chartQueryData, timePeriod);
        })
      )
    );
  }

  prepareChartSeriesData(chartQueryResult: any[], days: string[]){
    var aggregations: any[] = [];
    var chart: number[] = [];


    chartQueryResult.forEach((item: any) => {
      item['date'] = new Date(item['_id']).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      }).slice(0, -3).replace(/\//g, '-');

      if (aggregations[item.date]) {
        aggregations[item.date].count += item.count;
      } else {
        aggregations[item.date] = {
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
