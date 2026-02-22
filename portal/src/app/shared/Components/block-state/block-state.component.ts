import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'evntaly-block-state',
  templateUrl: './block-state.component.html',
  styleUrls: ['./block-state.component.css']
})
export class BlockStateComponent implements OnInit {
  @Input() data: any;
  @Input() title: string = 'Nothing to see here ... yet!';
  @Input() description: string = 'No data available yet. Start sending events to see insights here.';
  @Input() iconClass: string = 'icon ni ni-package-fill';
  @Input() link: string = '';
  @Input() linkText: string = 'No data available yet.';

  constructor() { }

  ngOnInit() {
  }

}
