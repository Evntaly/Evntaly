import { Component, OnInit } from '@angular/core';
import { event, alert } from '../../models';
import { ChartType } from 'chart.js';
import { EChartsOption } from 'echarts';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ManageAlertsComponent } from '../../../shared/Components';
import { ConfirmationComponent } from '../../../theme/confirmation/confirmation.component';
import { Location } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';

declare var bootstrap: any;
declare var $: any;
declare var NioApp: any;

class eventDetails {
  event: event = new event();
  most_adopted_features?: any[] = [];
  most_interactive_users?: any[] = [];
  first_occurance?: Date;
  last_occurance?: Date;
}

@Component({
  selector: 'app-parent-event-details',
  templateUrl: './parent-event-details.component.html',
  styleUrls: ['./parent-event-details.component.css'],
})
export class ParentEventDetailsComponent implements OnInit {
  eventID: string | null | undefined;
  event_details: eventDetails = new eventDetails;
  event: event = new event;
  kpis = { occurances: 0 , sessions: 0 , users: 0 };
  event_alert: alert = new alert;
  loading = false;
  notify = false;
  showTree: boolean = false;

  public lineChartType: ChartType = 'line';
  options: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        label: {
          backgroundColor: 'rgba(0,11,115,0.1)',
        },
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
  };

  mergeOptions: EChartsOption = {};


  constructor(
    private http: httpService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private clipboard: Clipboard,
    private readonly router: Router,
    private scrollStrategyOptions: ScrollStrategyOptions,
    private location: Location,
    private seoService: SeoService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.event.parentEventID = params.get('parentEventID');
      this.getEventDetails();
    });
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  getEventDetails() {
    this.http.Get(`${urls.GET_EVENT_DETAILS}/${this.event.parentEventID}`).subscribe((result: any) => {
      this.event_details = result;

      if (this.event_details.most_interactive_users!.length > 0)
        this.event_details.most_interactive_users = this.event_details.most_interactive_users!.filter(user => user.full_name.toLowerCase() !== 'unknown user');

      this.event = this.event_details.event;

      // Update page title with event name
      this.seoService.setInsightsTitle('events');
      if (this.event?.title) {
        this.seoService.setTitle(`${this.event.title} - Event Insights`);
      }

      this.getChartData();
      this.getAlertData();
      this.getEventsKPIs();
    })
  }

  getAlertData(){
    this.http.Get(`${urls.GET_ALERT_PER_PARENT_EVENT}/${this.event.parentEventID}`).subscribe((result: any) => {
      this.event_alert = result;
    })
  }

  createAlert(){
    this.notify = false;
    const dialogRef = this.dialog.open(ManageAlertsComponent, {
      enterAnimationDuration: 0,
      disableClose: false,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: { parentEventID: this.event.parentEventID }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        NioApp.Toast(
          "<h5>Success</h5><p>Alert has been added successfully.</p>",
          "success",
          { position: 'bottom-left' }
        );

        this.getAlertData();
      }
    })
  }

  deleteAlertConfirmation(){
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: {
        header: 'Deleting the alert ?',
        message: 'Deleting this alert will remove the alarm, and you will no longer receive notifications from any triggers.',
        confirm_btn : `Yes, Delete`,
        cancel_btn : 'No, Cancel',
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) this.deleteAlert();
    })
  }

  deleteEventConfirmation(){
    let message = 'Deleting this event will remove all of its occurances and you will no longer be able to track the event.';

    const dialogRef = this.dialog.open(ConfirmationComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: {
        header: 'Are you sure ?',
        message: message,
        confirm_btn : `Yes, Delete this event`,
        cancel_btn : 'No, Cancel',
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) this.deleteEvent();
    })
  }

  deleteEvent() {
    this.http.Get(`${urls.DELETE_EVENT}/${this.event.parentEventID}`).subscribe((result: any) => {

      NioApp.Toast(
        "<h5>Event Deleted Successfully</h5><p>Event and all of its occurances has beem removed.</p>",
        "success",
        { position: 'bottom-left' }
      );

      this.router.navigateByUrl('/insights/events');
    })
  }

  deleteAlert() {
    this.http.Get(`${urls.DELETE_ALERT_PER_PARENT_EVENT}/${this.event_alert._id}/${this.event.parentEventID}`).subscribe((result: any) => {

      NioApp.Toast(
        "<h5>Alert Deleted Successfully</h5><p>Alert has been removed.</p>",
        "success",
        { position: 'bottom-left' }
      );

      this.getAlertData();
    })
  }

  getEventsKPIs() {
    this.http.Get(`${urls.GET_EVENTS_KPIs}/${this.event.parentEventID}`).subscribe((result: any) => {
      this.kpis.occurances = result['occurances']['count'];
      this.kpis.sessions = result['sessions']['count'];
      this.kpis.users = result['users']['count'];
    })
  }

  //#region Helpers Functions ..
  back() {
    this.location.back();
  }

  getChartData(){
    var chart: number[] = [];

    this.http.Get(`${urls.EVENTS_OCCURANCES_DATA}/${this.event.parentEventID}`).subscribe((result) => {
      var occurancesChartData: any[] = result as any[];
      var agg: any[]= [];
      const days = helpers.getRangeOfDates(10);

      occurancesChartData.forEach((occurance) => {
        occurance['date'] = new Date(occurance['_id']).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        }).slice(0, -3).replace(/\//g, '-');
      })

      occurancesChartData.forEach(item => {
        if (agg[item.date]) {
          agg[item.date].count += item.count;
        } else {
          agg[item.date] = {
            _id: item._id,
            date: item.date,
            count: item.count
          };
        }
      });

      var t = Object.values(agg);

      days.forEach((day) => {
        var result = t.find(x => x.date == day);
        chart.push(result == undefined ? 0 : result['count']);
      })

      this.mergeOptions = {
        series: [
          {
            name: 'Occurances',
            type: 'line',
            stack: 'counts',
            areaStyle: {
              opacity: 0.2,
            },
            data: chart,
            smooth: true,
            showSymbol: false
          }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: helpers.getRangeOfDates(10),
          },
        ],
        yAxis: [
          {
            minInterval: 1
          }
        ]
      }
    })
  }

  timeAgo(date: string | number | Date){
    return helpers.timeAgo(date);
  };

  getInitials(name: string){
    return helpers.getInitials(name);
  }

  showUser(userId: any) {
    window.open(`insights/user-details/${userId}`, '_blank');
  }
  //#endregion
}
