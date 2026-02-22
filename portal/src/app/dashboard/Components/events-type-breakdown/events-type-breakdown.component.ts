import { Component, OnInit } from '@angular/core';
import { constants, httpService, urls } from '../../../core';
import { firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'dashboard-events-type-breakdown',
  templateUrl: './events-type-breakdown.component.html',
  styleUrls: ['./events-type-breakdown.component.css']
})
export class EventsTypeBreakdownComponent implements OnInit {
  selected_filter: any = '';
  filters: any = [
    { text: '7 Days', value: 7,  is_active: true },
    { text: '10 Days', value: 10,  is_active: false},
    { text: '30 Days',  value: 30,  is_active: false},
  ];

  chartOptions: any;

  constructor(private http: httpService) {

  }

  async ngOnInit() {
    let events_breakdown = await this.getEventTypeBreakdown();
    let data = this.generateRandomItems(events_breakdown);
    console.log(data)
    this.chartOptions = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        top: '2%',
        left: 'center',
      },
      series: [
        {
          name: 'Event Types Breakdown',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 3,
          },
          label: {
            show: false,
            position: 'center',
          },
          labelLine: {
            show: false,
          },
          data: data
        },
      ],
    };
  }

  generateRandomItems(data: { name: string; value: number }[]) {
    return data.map((item) => {
      const color = constants.eventBreakdownColors().find(x => x.type.toLocaleLowerCase() == item.name.toLowerCase())?.color ?? 'gray';
      return {
        value: item.value,
        name: item.name,
        itemStyle: { color }
      };
    });
  }

  getEventTypeBreakdown(): Promise<any> {
    return firstValueFrom(
      this.http.Get(`${urls.EVENT_TYPE_BREAKDOWN}/all time`, null).pipe(
        map((result: any) => {
          return result as any[];
          // return this.prepareChartSeriesData(chartQueryData, timePeriod);
        })
      )
    );
  }

}
