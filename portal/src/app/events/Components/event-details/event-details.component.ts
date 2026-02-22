import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { event, alert } from '../../models';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatDialog } from '@angular/material/dialog';
import { EChartsOption } from 'echarts';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConfirmationComponent } from '../../../theme/confirmation/confirmation.component';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { ManageAlertsComponent } from '../../../shared/Components';
declare var bootstrap: any;
declare var $: any;
declare var NioApp: any;

class eventDetails {
  event: event = new event;
  user_latest_activity_date?: string;
  user_created_at?: string;
  most_adopted_features?: any[] = [];
  most_interactive_users?: any[] = [];
}

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'],
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventDetailsComponent implements OnInit{
  eventID: string | null | undefined;
  event_details: eventDetails = new eventDetails;
  event: event = new event;
  kpis = { occurances: 0 , sessions: 0 , users: 0 };
  event_alert: alert = new alert;
  loading = false;
  notify = false;
  showTree: boolean = false;
  requestContextKeys: string[] = [];

  allowedRequestContextKeys: any[] = [
    { key: 'authorization', label: 'Authorization' },
    { key: 'cfRay', label: 'cf-ray' },
    { key: 'ip', label: 'IP' },
    { key: 'method', label: 'Method' },
    { key: 'referer', label: 'Referer' },
    { key: 'url', label: 'URL' },
    { key: 'userAgent', label: 'User Agent' },
    { key: 'xForwardedFor', label: 'X-Forwarded-For' },
    { key: 'xCustomHeader', label: 'X-Custom-Header' },
  ];

  constructor(private http: httpService, private route: ActivatedRoute, public dialog: MatDialog, private clipboard: Clipboard,
    private readonly router: Router, private scrollStrategyOptions: ScrollStrategyOptions, private location: Location,
    private seoService: SeoService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.event.eventID = params.get('eventID');
      this.getEventDetails();
    });
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  getEventDetails() {
    this.http.Get(`${urls.GET_OCCURANCE_DETAILS}/${this.event.eventID}`).subscribe((result: any) => {
      this.event_details = result;
      this.event = this.event_details.event;
      this.requestContextKeys = Object.keys(this.event!.requestContext!)
        .filter(key => !['host', 'origin', 'acceptEncoding', 'contentType', 'osVersion', 'browserVersion',
          'location', 'cfIpCountry', 'acceptLanguage', 'xForwardedHost', 'xRequestedWith', 'xForwardedFor', 'browser' , 'os'].includes(key))
        .sort((a, b) => {
          if (a.startsWith('x') && !b.startsWith('x')) return 1;
          if (!a.startsWith('x') && b.startsWith('x')) return -1;
          return a.localeCompare(b);
        })

      if(result["user"] !== null)
        this.event.user = result["user"];

      // Update page title with event name
      this.seoService.setEventDetailsTitle(this.event.title);

      this.getAlertData();
      this.changeEventStatus();
      // this.prepareJsonTreeViewer();
    })
  }

  private updateEventMetadata() {
    if (this.event && this.event.title) {
      this.seoService.setEventDetailsTitle(this.event.title);
    }
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

  deleteOccuranceConfirmation(){
    let message = 'You will be deleting only this occurance. This action is irreversible and cannot be undone.';

    const dialogRef = this.dialog.open(ConfirmationComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: {
        header: 'Are you sure ?',
        message: message,
        confirm_btn : `Yes, Delete this occurance`,
        cancel_btn : 'No, Cancel',
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) this.deleteOccurance();
    })
  }

  deleteOccurance() {
    this.http.Get(`${urls.DELETE_EVENT_OCCURANCE}/${this.event.eventID}`).subscribe((result: any) => {

      NioApp.Toast(
        "<h5>Occurance Deleted Successfully</h5><p>Data has beem removed.</p>",
        "success",
        { position: 'bottom-left' }
      );

      this.router.navigateByUrl('/occurances/all');
    })
  }

  changeEventStatus (){
    this.http.Put(`${urls.UPDATE_EVENT_STATUS}/${this.event.eventID}`).subscribe((result: any) => {
      console.log('Status updated!')
    })
  }

  showOccurancesByTopic(topic: any){
    window.open(`occurances/all?Topic=${topic}&Status=All`, '_blank');
  }

  showOccurancesByUserInfo(user: any){
    window.open(`occurances/all?User=${user}&Status=All`, '_blank');
  }

  showOccurancesByUserTags(tag: any){
    window.open(`occurances/all?Tags=${tag}&Status=All`, '_blank');
  }

  showOccurancesByUserFeature(feature: any){
    window.open(`occurances/all?Feature=${feature}&Status=All`, '_blank');
  }

  //#region Helpers Functions ..
  back() {
    this.location.back();
  }

  getEmojiColor(emoji: any, alpha: number = 0.3): string | null {
    return helpers.getEmojiDominantColor(emoji, alpha);
  }

  syntaxHighlight(): string {
    let json = Object.assign({} , this.event.data);
    let jsonStr = JSON.stringify(json, undefined, 4);

    jsonStr = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return jsonStr.replace(/("(\\u[\dA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number jsonv';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key jsonv';
        } else {
          cls = 'string jsonv';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean jsonv';
      } else if (/null/.test(match)) {
        cls = 'null jsonv';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  prepareJsonTreeViewer() {
    if (this.event && this.event.data) {
      const treeData = helpers.convertToTreeData(this.event.data);

      $('#basic-tree').jstree({
        'core': {
          'data': treeData,
          'themes': {
            'responsive': false,
            'icons': false
          }
        }
      }).on('select_node.jstree', (e: any, data: any) => {
        // const selectedNode = data.node;
        // console.log('Selected node:', selectedNode);
      });

      this.showTree = true;
    } else {
      this.showTree = false;
    }
  }

  copyJsonToClipboard() {
    const jsonObject = this.event.data;
    const jsonString = JSON.stringify(jsonObject);
    this.clipboard.copy(jsonString);
    NioApp.Toast(
      "<h5>Copied</h5>",
      "info",
      { position: 'bottom-left' }
    );
  }

  // Method to get the runtime image source based on runtime value
  getRuntimeImageSrc(runtime: string | undefined): string {
    return helpers.getRuntimeLogo(runtime || '');
  }

  getOperatingSystemImageSrc(os: string | undefined): string {
    return helpers.getOSLogo(os || '');
  }

  getBrowserImageSrc(browser: string | undefined): string {
    return helpers.getBrowserLogo(browser || '');
  }

  timeAgo(date: string | number | Date){
    return helpers.timeAgo(date);
  };

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    NioApp.Toast('<h5>Copied</h5>', 'info', { position: 'bottom-left' });
  }
  //#endregion
}
