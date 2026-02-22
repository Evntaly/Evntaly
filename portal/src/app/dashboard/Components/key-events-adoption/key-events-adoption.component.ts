import { Component, OnInit } from '@angular/core';
import { helpers, httpService, urls } from '../../../core';
import { firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'dashboard-key-events-adoption',
  templateUrl: './key-events-adoption.component.html',
  styleUrls: ['./key-events-adoption.component.css']
})
export class KeyEventsAdoptionComponent implements OnInit {
  selected_filter: any = '';
  filters: any = [
    { text: '7 Days', value: 7,  is_active: true },
    { text: '10 Days', value: 10,  is_active: false},
    { text: '30 Days',  value: 30,  is_active: false},
  ];

  chartOptions: any;
  mergeChartOptions: any;
  events_count: number = 0;

  constructor(private http: httpService) {
  }

  async ngOnInit() {
    var events: any[] = [];
    var adoption: any[] = [];
    let activation_adoption_data = await this.getActivationAdoption();
    activation_adoption_data.forEach((item: any) => {
      events.push(item.title);
      adoption.push(item.percentageOfUsers.toFixed(2));
    });

    this.events_count = events.length;

    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: events.reverse(),
      },
      series: [
        {
          name: 'Users Participation Rate %',
          type: 'bar',
          stack: 'total',
          label: { show: true },
          emphasis: { focus: 'series' },
          itemStyle: { color: '#000B73' },
          data: adoption.reverse(),
        },
      ],
    };
  }


  getActivationAdoption(): Promise<any> {
    return firstValueFrom(
      this.http.Get(`${urls.ACTIVATION_ADOPTION}/all time`, null).pipe(
        map((result: any) => {
          return result as any[];
          // return this.prepareChartSeriesData(chartQueryData, timePeriod);
        })
      )
    );
  }

}
