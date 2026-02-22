import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { helpers } from '../../../core';

@Component({
  selector: 'evntaly-filters-bar',
  templateUrl: './filters-bar.component.html',
  styleUrls: ['./filters-bar.component.css']
})
export class FiltersBarComponent implements OnInit, AfterViewInit {
  @Output() notify: EventEmitter<{filter: string, selection: any, is_removed: boolean}>
    = new EventEmitter<{filter: string, selection: any, is_removed: boolean}>();

  @Output() notify_many: EventEmitter<boolean>
    = new EventEmitter<boolean>();
  @Input('url_filters') url_filters: any;
  search_key = '';

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
  statuses = [
    {text: 'New' , is_active: true},
    {text: 'Seen' , is_active: false},
    {text: 'All' , is_active: false},
  ];
  search_criteria_options = [
    {text: 'Name Or Description', is_active: false},
    {text: 'Tags' , is_active: false},
    {text: 'User' , is_active: false},
    {text: 'Feature' , is_active: false},
    {text: 'Topic' , is_active: false},
  ]
  filters: any = {
    search_by : 'Search By',
    selected_statuse: 'New',
    selected_range: 'Last 7 days',
  }

  dynamic_filters: any[] = []
  url_saved_filters: any[] = [];
  constructor() { }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.changeDateFilter(this.url_filters['Range'] || 'Last 7 days', true);

    if(Object.keys(this.url_filters).length > 0){
      this.changeDateFilter(this.url_filters['Range'] || 'Last 7 days', true);
      this.changeStatusFilter(this.url_filters['Status'] || 'New', true);

      Object.keys(this.url_filters).forEach((key) => {
        if(['Name Or Description', 'Feature' , 'Topic', 'User', 'Tags'].includes(key)){
          this.addGenericFilter(key, this.url_filters[key], true);
        }
      })

      this.emitManyFiltersFoundInURL(true);
    }
  }

  changeSearchCriteria(selection: string){
    this.search_criteria_options.forEach((item) => item.is_active = false);

    let selected = this.search_criteria_options.find(x => x.text.toLowerCase() == selection.toLowerCase());
    selected!.is_active = true;
    this.filters.search_by = selected!.text;
  };

  addFilter(event: any){
    if (event.key === 'Enter') {
      if(this.filters.search_by == 'search by' || this.filters.search_by == ''){
        //TODO: Show warning!
      } else {
        const search_value = event.target.value;
        // Push new filter the parent component.
        this.addGenericFilter(this.filters.search_by, search_value);

        //Resect criteria oprtions contorller.
        this.search_criteria_options.forEach((item) => item.is_active = false);
        this.filters.search_by = 'search by';
        this.search_key = '';
      }
    }
  };

  addGenericFilter(filter: string, selection: any, push: boolean = false){
    this.dynamic_filters.push({ _id: filter, label: `${filter} : ${selection}` });

    if(!push)
      this.emitFilterChange(filter, selection);
  };

  removeGenericFilter(filter: string) {
    this.dynamic_filters = this.dynamic_filters.filter(item => item._id !== filter);

    this.emitFilterChange(filter, '', true)
  }

  changeDateFilter(selection: string, immediate_push: boolean = false){
    if(selection !== undefined){
      this.dates.forEach((item) => item.is_active = false);

      let selected = this.dates.find(x => x.text.toLowerCase() == selection.toLowerCase());
      selected!.is_active = true;
      this.filters.selected_range = selected!.text;

      if(!immediate_push)
        this.emitFilterChange('Range', selection);
    }
  };

  changeStatusFilter(selection: string, immediate_push: boolean = false){
    if(selection !== undefined){
      this.statuses.forEach((item) => item.is_active = false);

      let selected = this.statuses.find(x => x.text.toLowerCase() == selection.toLowerCase());
      selected!.is_active = true;
      this.filters.selected_statuse = selected!.text;

      if(!immediate_push)
        this.emitFilterChange('Status', selection);
    }
  };

  emitFilterChange(filter: string, selection: any, is_removed: boolean = false){
    this.notify.emit({ filter: filter, selection: selection, is_removed });
  };

  emitManyFiltersFoundInURL(parse_url: boolean){
    this.notify_many.emit(parse_url);
  };

}
