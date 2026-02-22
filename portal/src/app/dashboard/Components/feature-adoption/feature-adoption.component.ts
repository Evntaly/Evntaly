import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { helpers, httpService, urls } from '../../../core';
import { feature } from '../../../insights/models/feature';
import { rankChartData } from '../../../shared/Components/rank-chart/rank-chart.component';
declare var NioApp: any;

@Component({
  selector: 'dashboard-feature-adoption',
  templateUrl: './feature-adoption.component.html',
  styleUrls: ['./feature-adoption.component.css']
})
export class FeatureAdoptionComponent implements OnInit {
  data: feature[] = [];
  chartData: rankChartData[] = [];

  sorting : any = {
    sortBy: 'adoption',
    sortAs: 'desc'
  };

  pagination : any = {
    skip: 0,
    limit: 5
  };

  constructor(private http: httpService) { }

  ngOnInit() {
    this.getFeaturesList();
  }

  getFeaturesList() {
    this.http.Get(`${urls.LIST_FEATURES}/all time`, {...this.sorting, ...this.pagination }).subscribe((result: any) => {
      this.data = result['data'];

      this.data.forEach((feature: any) => {
        feature.last_seen_active_time_ago = helpers.timeAgo(feature.last_seen_active);
      });

      // Map to rankChartData format
      this.chartData = this.data.map((feature: any) => ({
        name: feature.name || feature.title || 'Unknown Feature',
        fullName: feature.description || feature.name,
        icon: 'icon ni ni-activity',
        color: 'rgba(242, 66, 110, 0.3)',
        value: Math.round(feature.adoption) || 0,
        valueLabel: '%',
        percentage: 0
      }));
    })
  }
}
