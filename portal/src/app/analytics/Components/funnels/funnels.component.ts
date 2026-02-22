import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateFunnelComponent } from './Components';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { SeoService, httpService, urls } from '../../../core';

@Component({
  selector: 'app-funnels',
  templateUrl: './funnels.component.html',
  styleUrls: ['./funnels.component.css']
})
export class FunnelsComponent implements OnInit {
  filters: any = [
    { text: 'Last 7 Days', value: 7,  is_active: true },
    { text: 'Last 30 Days', value: 30,  is_active: false},
    {text: 'This week' , is_active: false},
    {text: 'This month' , is_active: false},
  ];

  selected_filter: any = '';
  funnels: any[] = [];

  kpiVisibility: { [key: string]: boolean } = {
    'Users': true,
    'Active Users': true,
    'Sessions': false,
    'Page Views': false
  };

  constructor(public dialog: MatDialog, private scrollStrategyOptions: ScrollStrategyOptions, private seoService: SeoService, private http: httpService) { }

  ngOnInit() {
    this.seoService.setFunnelsTitle();
    this.getFunnels();
  }

  getFunnels(){
    this.http.Get(`${urls.LIST_FUNNEL}`).subscribe((result: any) => {
      result.data.forEach((funnel: any) => {
        this.funnels.push({
          id: funnel['_id'],
          name: funnel.funnel_name,
          description: funnel.metadata.description || 'No description added for this funnel.',
          conversionRate: funnel?.conversionRate,
          trendValue: funnel?.change?.value,
          trendSign: funnel?.change?.sign,
          createdAt: funnel?.createdAt || '2025-01-01',
          chartData: funnel?.chart_data || [20,25,30,28,32,22,22],
        });
      });
      console.log(this.funnels);
    });
  }

  async changeFilter(selection: string){
    this.filters.forEach((item: any) => item.is_active = false);

    let selected = this.filters.find((x: any) => x.text.toLowerCase() == selection.toLowerCase());
    selected!.is_active = true;
    this.selected_filter = selected?.text;
  }

  openCreateFunnelModal(){
    const dialogRef = this.dialog.open(CreateFunnelComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.funnels = [];
      this.getFunnels();
    })
  }

}
