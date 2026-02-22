import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-funnel',
  templateUrl: './funnel.component.html',
  styleUrls: ['./funnel.component.css']
})
export class FunnelComponent implements OnInit {
  Math = Math;

  @Input() funnelData: any = {
    id: 1,
    name: 'Signup Funnel',
    description: 'Track user journey from pricing page to account creation',
    conversionRate: 35.4,
    trend: 0.7,
    timePeriod: 'Last 7 days',
    chartData: [20, 25, 30, 28, 32, 22, 22]
  };

  chartOptions: EChartsOption = {};

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onViewDetails() {
    this.router.navigate(['/analytics/funnel-details', this.funnelData.id]);
  }
}
