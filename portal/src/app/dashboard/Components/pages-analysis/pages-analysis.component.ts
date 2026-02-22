import { Component, OnInit } from '@angular/core';
import { urls } from '../../../core/helpers/urls';
import { map } from 'rxjs/operators';
import { httpService } from '../../../core/services/http';
import { InternalEventsService } from '../../../core/services/internal-events.service';

@Component({
  selector: 'dashboard-pages-analysis',
  templateUrl: './pages-analysis.component.html',
  styleUrls: ['./pages-analysis.component.css']
})
export class PagesAnalysisComponent implements OnInit {

  pagesData: any[] = [];

  selected_filter: any = '';

  constructor(private http: httpService, private eventService: InternalEventsService) {
    this.eventService.internalEvent$.subscribe((event: any) => {
      this.selected_filter = event;
      this.loadPagesData(this.selected_filter);
    });
  }

  ngOnInit() {
    this.loadPagesData('Last 7 Days');
  }

  private loadPagesData(selected_filter: string) {
    this.http.Get(`${urls.URL_VIEWS_CHART_DASHBOARD}/${selected_filter}`, null).pipe(
      map((result: any) => {
        return result;
      })
    ).subscribe((result: any) => {
      this.pagesData = result;
      this.pagesData.forEach((item: any) => {
        item.color = '#000B73';
        item.percentage = 100;
        item.isImage = false;
        item.valueLabel = 'Views';
      });
    });
  }

}
