import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import 'highlight.js/styles/base16/bright.css';
import { constants } from '../../../../../core';
@Component({
  selector: 'sdk-integration',
  templateUrl: './sdk-integration.component.html',
  styleUrls: ['./sdk-integration.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SdkIntegrationComponent implements OnInit {
  selected_lang = '';
  selected_lang_details: any = {};
  @Output() notify: EventEmitter<string> = new EventEmitter<string>();


  constructor() { }

  ngOnInit() {
    this.selectLang('javascript');
  }

  selectLang(lang: any) {
    this.selected_lang = lang;
    this.selected_lang_details = constants.getOnBoardingCodeSnippet().find(x => x.lang == lang);
  }

  next() {
    this.notify.emit('sdk_integrations');
  }

}
