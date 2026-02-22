import { Component, OnInit } from '@angular/core';

export interface TrafficSource {
  name: string;
  fullName?: string;
  icon: string;
  color: string;
  visits: number;
  percentage: number;
}

@Component({
  selector: 'dashboard-device-insights',
  templateUrl: './device-insights.component.html',
  styleUrls: ['./device-insights.component.css']
})
export class DeviceInsightsComponent implements OnInit {
  selected_filter: any = '';
  filters: any = [
    { text: '7 Days', value: 7,  is_active: true },
    { text: '10 Days', value: 10,  is_active: false},
    { text: '30 Days',  value: 30,  is_active: false},
  ];
  constructor() { }

  ngOnInit(): void {
  }

  async changeFilter(selection: string){
    this.filters.forEach((item: any) => item.is_active = false);

    let selected = this.filters.find((x: any) => x.text.toLowerCase() == selection.toLowerCase());
    selected!.is_active = true;
    this.selected_filter = selected?.text;
  };


}
