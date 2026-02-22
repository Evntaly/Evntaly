import { Component, OnInit, Input } from '@angular/core';

export interface rankChartData {
  name: string;
  fullName?: string;
  icon: string;
  color: string;
  value: number;
  valueLabel?: string;
  percentage: number;
  barColor?: string; // Dynamic bar color based on threshold

  // Icon display options
  isIcon?: boolean;   // Show icon
  isImage?: boolean;  // Show image
  isEmpty?: boolean;  // Show nothing
  imageSrc?: string;  // Image source URL
  isImageNonResolvable?: boolean;  // Image source URL
}

@Component({
  selector: 'evntaly-rank-chart',
  templateUrl: './rank-chart.component.html',
  styleUrls: ['./rank-chart.component.css']
})
export class RankChartComponent implements OnInit {
  @Input() data: rankChartData[] = [];
  @Input() threshold: number = 12;

  private readonly colors = {
    high: '#DEE2FB',
    low: '#FFE6E6'
  };

  constructor() { }

  ngOnInit() {
    this.calculatePercentages();
  }

  ngOnChanges(): void {
    this.calculatePercentages();
  }

  calculatePercentages(): void {
    if (this.data && this.data.length > 0) {
      const maxValue = Math.max(...this.data.map(s => s.value));
      this.data.forEach(source => {
        source.percentage = Number((maxValue > 0 ? (source.value / maxValue) * 100 : 0).toFixed(1));
        source.barColor = this.getBarColor(source.value);
      });

      this.data.sort((a, b) => b.value - a.value);
    }
  }

  private getBarColor(value: number): string {
    if (value >= this.threshold) {
      return this.colors.high;
    } else {
      return this.colors.low;
    }
  }

  formatValue(value: number, valueLabel: string): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString() + ' ' + valueLabel;
  }

  trackBySource(index: number, source: rankChartData): string {
    return source.name;
  }
}
