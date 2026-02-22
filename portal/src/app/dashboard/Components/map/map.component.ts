import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as echarts from 'echarts';
import worldGeoJSON from '../../../../assets/js/world.json'
import { httpService, InternalEventsService, urls } from '../../../core';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { helpers } from '../../../core';

@Component({
  selector: 'dashboard-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  chartOptions: any;
  mergeChartOptions: any;

  selected_filter: any = '';


  constructor(private http: httpService, private eventService: InternalEventsService) {
    this.eventService.internalEvent$.subscribe((event: any) => {
      this.selected_filter = event;
      this.initMapData(this.selected_filter);
    });
  }

  ngOnInit() {

    echarts.registerMap('world', worldGeoJSON as any);
    this.initMapData('Last 7 Days');
    this.chartOptions = {};
  }

  async initMapData(selected_filter: string){
    const data = await this.getCountriesData(selected_filter);

    this.mergeChartOptions = {
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
        // min: 0,
        // max: 1000000,
        show: false,
        inRange: {
          color: ['#9da2d1', '#000B73'],
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
            center: [0, 30],
            emphasis: {
              itemStyle: {
                areaColor: '#EEEEEE',
                borderColor: '#000B73',
                borderWidth: 0.5,
              },
              label: {
                show: false
              }
            },
          data: data,
        },
      ],
    };
  };

  getCountriesData(selected_filter: string): Promise<any> {
    return firstValueFrom(
      this.http.Get(`${urls.COUNTRIES_MAP_DATA_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
        map((result: any) => {
          return result;
        })
      )
    );
  }
}
