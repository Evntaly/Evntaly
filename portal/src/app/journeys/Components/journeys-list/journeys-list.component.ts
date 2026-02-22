import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { Clipboard } from '@angular/cdk/clipboard';
declare var NioApp: any;

@Component({
  selector: 'app-journeys-list',
  templateUrl: './journeys-list.component.html',
  styleUrls: ['./journeys-list.component.css']
})
export class JourneysListComponent implements OnInit, AfterContentChecked {
  data: any[] = [];
  events: any[] = [];
  events_loading = false;
  sessions_search_criteris: any = { "criteria" : {} };
  search_text = '';
  search_txt_placeholder = '';

  selected_range: string = '';
  dates = [
    {text: 'Today' , is_active: true},
    {text: 'Yesterday' , is_active: false},
    {text: 'Last 7 days' , is_active: false},
    {text: 'Last 30 days' , is_active: false},
    {text: 'This week' , is_active: false},
    {text: 'This month' , is_active: false},
    // {text: 'Last month' , is_active: false},
    // {text: 'Last week' , is_active: false},
    {text: 'All time' , is_active: false},
  ];

  search_by = [
    {text: 'Session ID' , is_active: true , key: 'sessionID'},
    {text: 'User Name' , is_active: false , key: 'name'},
    {text: 'User ID' , is_active: false , key: 'id'},
    {text: 'Email' , is_active: false , key: 'email'},
  ];

  constructor(private http: httpService, private clipboard: Clipboard, private seoService: SeoService) {
    this.seoService.setJourneysTitle();
  }

  ngAfterContentChecked(): void {
    NioApp.TGL.content(".toggle");
  }

  ngOnInit() {
    this.changeDateFilter('last 7 days');
    this.changeSessionFilter('Session ID');
  }

  getListOfSessions(){
    this.events = [];
    this.http.Post(`${urls.GET_LIST_OF_SESSIONS}/${this.selected_range}`, null, this.sessions_search_criteris).subscribe((response: any) =>{
      this.data = response;
    })
  }

  getListOfEventsInSession(sessionID: string){
    this.events_loading = true;
    this.http.Get(`${urls.GET_LIST_OF_EVENTS_IN_SESSION}/${sessionID}`, null).subscribe((response: any) =>{
      this.events = response;
      this.events_loading = false;
      this.data.forEach((item) => item.is_active = false);
      let selected = this.data.find(x => x.sessionID.toLowerCase() == sessionID.toLowerCase());
      selected!.is_active = true;
    })
  }

  changeDateFilter(selection: string){
    if(selection !== undefined){
      this.dates.forEach((item) => item.is_active = false);

      let selected = this.dates.find(x => x.text.toLowerCase() == selection.toLowerCase());
      selected!.is_active = true;
      this.selected_range = selected!.text;
      this.getListOfSessions();
    }
  };

  changeSessionFilter(selection: string){
    if(selection !== undefined){
      this.search_by.forEach((item) => item.is_active = false);

      let selected = this.search_by.find(x => x.text.toLowerCase() == selection.toLowerCase());
      selected!.is_active = true;
      this.search_txt_placeholder = `Search By ${selected?.text}`;

    }
  };

  searchByProvidedSearchKey(e: any){
    this.search_text = e.target.value;
    if (e.key == 'Enter') {
      let selected = this.search_by.find(x => x.is_active);
      let key: string = selected?.key || '';
      this.sessions_search_criteris.criteria[key] = this.search_text;
      this.getListOfSessions();
    }
  }

  getBgClassForName(initial: any) {
    return helpers.getColorForInitial(initial);
  };

  copyToClipboard(txt: string) {
    this.clipboard.copy(txt);
    NioApp.Toast('<h5>Copied</h5>', 'info', { position: 'bottom-left' });
  }

  clearSearch(){
    this.sessions_search_criteris = { "criteria" : {} };
    this.search_text = '';
    this.getListOfSessions();
  }

  getEmojiColor(emoji: any, alpha: number = 0.3): string | null {
    return helpers.getEmojiDominantColor(emoji, alpha);
  }

  showEventOccurance(eventID: any) {
    window.open(`occurances/details/${eventID}`, '_blank');
  }

  showDocs(){
    window.open('https://evntaly.gitbook.io/evntaly/journeys');
  }
}
