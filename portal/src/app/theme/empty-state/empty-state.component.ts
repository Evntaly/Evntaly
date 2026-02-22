import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'evntaly-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent implements OnInit {
  @Input('icon') icon: string | undefined;
  @Input('msg') msg: string | undefined;
  @Input('link-msg') lnk_msg?: string | undefined;
  @Input('link') link: string | undefined;

  constructor() { }

  ngOnInit() {
  }

}
