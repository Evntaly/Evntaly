import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dashboard-user-retention',
  templateUrl: './user-retention.component.html',
  styleUrls: ['./user-retention.component.css']
})
export class UserRetentionComponent implements OnInit {

  chartOptions: any;

  ngOnInit(): void {
    const cohorts = ['August 2024', 'September 2024', 'October 2024'];
    const days = Array.from({ length: 31 }, (_, i) => `Day ${i}`);

    const seriesData = [
      {
        name: 'August 2024',
        type: 'line',
        data: [100, 85, 75, 70, 65, 60, 20, 55, 52, 50, 48, 46, 44, 33, 40, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 23, 26, 25, 24, 53], // Example data
        smooth: true
      },
      {
        name: 'September 2024',
        type: 'line',
        data: [100, 82, 74, 68, 63, 59, 57, 54, 51, 49, 47, 45, 43, 66, 39, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 55, 26, 25, 24, 23, 22], // Example data
        smooth: true
      },
      {
        name: 'October 2024',
        type: 'line',
        data: [100, 80, 70, 65, 60, 55, 53, 51, 98, 47, 45, 43, 41, 99, 37, 35, 34, 33, 32, 31, 30, 29, 28, 44, 26, 25, 24, 23, 63, 21, 20], // Example data
        smooth: true
      }
    ];

    // Chart configuration
    this.chartOptions = {
      title: {
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: true,
        orient: 'horizontal',
        // top: '10%',
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
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} %'
        }
      },
      series: seriesData
    };
  }
}
