import { userDetails } from './../../models/user-details';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { ActivatedRoute } from '@angular/router';
import { keyEventsChecklist } from '../../models/key-events-checklist';
import { alert } from '../../models/alert';
import { MatDialog } from '@angular/material/dialog';
import { ManageAlertsComponent } from '../../../shared/Components';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { ConfirmationComponent } from '../../../theme/confirmation/confirmation.component';
import { Clipboard } from '@angular/cdk/clipboard';
declare var NioApp: any;


@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UserDetailsComponent implements OnInit {
  loading = false;
  heatmap_mode = 'Horizontal';
  heatmap_action = 'Events';
  heatmap_theme = 'deepblue';
  user_heatmap_data: any[] = [];
  heatmap_options = { range: 3 };
  userID = '';
  checklist_count = 0;
  user_details: userDetails | undefined;
  events_checklist: keyEventsChecklist[] = [];
  user_vitals = {
    engagement_depth: 0,
    bounce_rate: 0,
    avg_session_duration: '0m',
    general_status: 'Idle',
  };

  additional_attrbutes = {
    id: 101,
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 29,
    isSubscribed: true,
    lastLogin: '2023-09-14T10:45:00Z',
  };
  event_alert: alert = new alert();

  constructor(
    private http: httpService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private scrollStrategyOptions: ScrollStrategyOptions,
    private location: Location,
    private clipboard: Clipboard,
    private seoService: SeoService
  ) {
    this.route.params.subscribe((params) => {
      this.userID = params['userID'];
    });
  }

  ngOnInit(): void {
    this.getUserDetails();
    this.getUserActivityChartData();
    this.getKeyEventsChecklist();
    this.getUserVitals();
    this.getAlertData();
  }

  getUserDetails() {
    this.http
      .Get(`${urls.GET_USER_DETAILS}/${this.userID}`, null)
      .subscribe((result: any) => {
        this.user_details = result;
        this.user_details!.user!.initials = helpers.getInitials(
          this.user_details!.user!.full_name
        );
        this.additional_attrbutes = this.user_details!.user!.data;

        // Update page title with user name
        this.seoService.setUserDetailsTitle(this.user_details?.user?.full_name);
      });
  }

  getUserActivityChartData() {
    this.loading = true;
    this.http
      .Get(`${urls.USER_ACTIVITY_CHART}/${this.userID}`, null)
      .subscribe((result: any) => {
        this.user_heatmap_data = result;
        this.loading = false;
      });
  }

  getKeyEventsChecklist() {
    this.http
      .Get(`${urls.GET_USER_EVENTS_CHECKLIST}/${this.userID}`, null)
      .subscribe((result: any) => {
        this.events_checklist = result;
        this.checklist_count = this.events_checklist.filter(
          (obj) => obj.is_existing
        ).length;
      });
  }

  getUserVitals() {
    this.http
      .Get(`${urls.GET_USER_VITALS}/${this.userID}`, null)
      .subscribe((result: any) => {
        this.user_vitals = result;
      });
  }

  createAlert() {
    const dialogRef = this.dialog.open(ManageAlertsComponent, {
      enterAnimationDuration: 0,
      disableClose: false,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: { userID: this.userID },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        NioApp.Toast(
          '<h5>Success</h5><p>Alert has been added successfully.</p>',
          'success',
          { position: 'bottom-left' }
        );

        this.getAlertData();
        console.log(this.event_alert);
      }
    });
  }

  getAlertData() {
    this.http
      .Get(`${urls.GET_ALERT_PER_USER}/${this.userID}`)
      .subscribe((result: any) => {
        this.event_alert = result;
      });
  }

  back() {
    this.location.back();
  }

  syntaxHighlight(): string {
    return helpers.syntaxHighlight(this.additional_attrbutes);
  }

  timeAgo(date: any) {
    let res = helpers.timeAgo(date);
    return res
      .replace(' ago', '')
      .replace('minute', 'Min')
      .replace('second', 'Sec')
      .replace('hour', 'Hour')
      .replace('day', 'Day')
      .replace('week', 'Week')
      .replace('month', 'Month')
      .replace('year', 'Year')
      .replace('minutes', 'Mins')
      .replace('seconds', 'Secs')
      .replace('hours', 'Hours')
      .replace('days', 'Days')
      .replace('weeks', 'Weeks')
      .replace('months', 'Months')
      .replace('years', 'Years');
  }

  deleteAlertConfirmation() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: {
        header: 'Deleting the alert ?',
        message:
          'Deleting this alert will remove the alarm, and you will no longer receive notifications from any triggers.',
        confirm_btn: `Yes, Delete`,
        cancel_btn: 'No, Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.deleteAlert();
    });
  }

  deleteAlert() {
    this.http
      .Get(
        `${urls.DELETE_ALERT_PER_USER}/${this.event_alert._id}/${this.userID}`
      )
      .subscribe((result: any) => {
        NioApp.Toast(
          '<h5>Alert Deleted Successfully</h5><p>Alert has been removed.</p>',
          'success',
          { position: 'bottom-left' }
        );

        this.getAlertData();
      });
  }


  copyToClipboard() {
    this.clipboard.copy(JSON.stringify(this.additional_attrbutes));
    NioApp.Toast('<h5>Copied</h5>', 'info', { position: 'bottom-left' });
  }

  showEventOccurance(eventID: any) {
    window.open(`occurances/details/${eventID}`, '_blank');
  }
}
