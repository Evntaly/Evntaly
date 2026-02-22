import { AfterViewInit, Component, OnInit } from '@angular/core';
import { eventsSearchCriteria } from '../../models';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { DatePipe } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { OnBoardingComponent } from '../../../developer-account/Components';
declare var NioApp: any;
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit, AfterViewInit {
  events: any[] = [];
  private socket: Socket;
  private audio = new Audio();

  loading = false;
  search_mode = false;
  no_events_logged = false; //TODO: Design initial request whenever the page loaded
  query_params: any;
  incoming_url_query_string: any = {};

  skip: number = 0;
  limit: number = 10;
  show_more = false;
  show_more_loading = false;



  constructor(private http: httpService, private datePipe: DatePipe, private router: Router,
    private route: ActivatedRoute, private location: Location, private dialog: MatDialog,
    private seoService: SeoService
  ) {
    this.seoService.setEventsTitle();

    const developer = localStorage.getItem('developer') || '{}';
    const token = JSON.parse(developer)?.['token'];

    this.socket = io(environment.gateWayURL, {
      query: { token: token },
      path: environment.socketURL,
    });

    this.audio.src = 'assets/sound/mixkit-software-interface-back-2575.wav';
    this.audio.load();
  }

  ngAfterViewInit(): void {
    this.query_params = helpers.getQueryParams();
  }



  async ngOnInit() {
    // Prevent sending init. request when there is a filters added in the URL already.
    this.query_params = helpers.getQueryParams();
    if(Object.keys(this.query_params).length == 0)
      this.listEvents();


    this.events = [];
    this.onMessage().subscribe(message => {
      this.listEvents(true);
    });
  }

  public onMessage(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('event.created', (data: any) => {
        observer.next(data);
      });
    });
  }

  viewEventDetails(id: string) {
    this.router.navigate(['occurances/details/', id]);
  }

  viewParentEventDetails(id: string) {
    this.router.navigate(['insights/event-details/', id]);
  }

  listEvents(is_rt = false, is_loading_enabled = true) {
    let search_criteria : eventsSearchCriteria = this.mapQueryStringToSearchCriteria(this.query_params);
    if(is_loading_enabled) {
      this.loading = true;
      this.skip = 0;
      this.limit = 10;
    }

    // if(this.search_mode) return;
    if (is_rt) {
      NioApp.Toast(
        "<h5>New Event</h5><p>You have received a new event.</p>",
        "info",
        { position: 'bottom-left' }
      );
      this.audio.play();
    }
    this.http.Post(`${urls.GET_EVENTS}`,{ skip: this.skip , limit: this.limit  }, {'criteria' : search_criteria }).subscribe((result: any) => {
      if(is_loading_enabled) this.loading = false;
      this.prepareEventsList(result, is_loading_enabled);
    })
  }

  loadMoreEvents() {
    this.show_more_loading = true;
    this.skip += this.limit;
    this.listEvents(false, false);
  }

  async onFiltersChange(f: { filter?: string, selection?: any, is_removed: boolean}) {
    // if the filter is already added and the request sent needs to remove it
    // Just delete it from the hash map and rebuild the URL again.
    if(this.incoming_url_query_string[f.filter!] != undefined && f.is_removed)
      delete this.incoming_url_query_string[f.filter!];
    else
      this.incoming_url_query_string[f.filter!] = f.selection;

    const url = this.route.snapshot.pathFromRoot.map(route => route.url.map(segment => segment.toString()).join('/')).join('/');
    const updatedUrl = `${url}?${new URLSearchParams(this.incoming_url_query_string).toString()}`;
    this.location.replaceState(updatedUrl);
    this.query_params = helpers.getQueryParams();
    this.listEvents();
  }

  async onManyFiltersFoundInURL(parse_url: boolean = false) {
    if(parse_url){
      this.query_params = helpers.getQueryParams();
      Object.keys(this.query_params).forEach((k) => { this.incoming_url_query_string[k] = this.query_params[k] });

      this.listEvents();
    }
  }


  //#region Helpers Functions ..
  getEmojiColor(emoji: any, alpha: number = 0.3): string | null {
    return helpers.getEmojiDominantColor(emoji, alpha);
  }

  prepareEventsList(result: any, is_loading_enabled = true) {
    result['data'].forEach((e: any) => {
      e["date"] = this.datePipe.transform(e["createdAt"], 'short');
    })
    this.show_more = this.skip + this.limit < result['collectionSize'];

    if(is_loading_enabled) {
      this.events = result['data'];
    }
    else {
      this.events = this.events.concat(result['data']);
      this.show_more_loading = false;
    }
  }

  mapQueryStringToSearchCriteria(source: any): eventsSearchCriteria {
    return {
      status: source['Status'] || 'new',
      range: source['Range'] || 'last 7 days',
      metadata: source['Name Or Description'],
      featureKey: source['Feature'],
      topicKey: source['Topic'],
      userKey: source['User'],
      tags: source['Tags'] == undefined ? source['Tags'] : source['Tags'].split(',')
    };
  }
  //#endregion

}
