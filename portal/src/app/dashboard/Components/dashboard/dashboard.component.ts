import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OnBoardingComponent } from '../../../developer-account/Components';
import { InternalEventsService, SeoService } from '../../../core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  filters: any = [
    // { text: 'Today', value: 1,  is_active: false },
    { text: 'Last 7 Days', value: 7,  is_active: true },
    { text: 'Last 30 Days', value: 30,  is_active: false},
    {text: 'This week' , is_active: false},
    {text: 'This month' , is_active: false},
  ];

  selected_filter: any = '';

  kpiVisibility: { [key: string]: boolean } = {
    'Users': true,
    'Active Users': true,
    'Sessions': false,
    'Page Views': false
  };

  constructor(private dialog: MatDialog, private seoService: SeoService, private eventService: InternalEventsService) {
    this.seoService.setDashboardTitle();
    this.changeFilter('Last 7 Days');
  }

  ngOnInit() {
  }

  onKpiVisibilityChange(newVisibility: { [key: string]: boolean }) {
    this.kpiVisibility = newVisibility;
  }

  async changeFilter(selection: string){
    this.filters.forEach((item: any) => item.is_active = false);

    let selected = this.filters.find((x: any) => x.text.toLowerCase() == selection.toLowerCase());
    selected!.is_active = true;
    this.selected_filter = selected?.text;

    // send event to kpis component to update the kpis subject event
    this.eventService.emitEvent(this.selected_filter);
  }
}
