import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { httpService, urls } from '../../../core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { integration } from '../../models';
import { Select2Data, Select2UpdateEvent, Select2Value } from 'ng-select2-component';
declare var bootstrap: any;
declare var $: any;
declare var NioApp: any;

@Component({
  selector: 'app-slack-integration-setting',
  templateUrl: './slack-integration-setting.component.html',
  styleUrls: ['./slack-integration-setting.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SlackIntegrationSettingComponent implements OnInit {

  channels : Select2Data = [];
  channelID!: Select2Value;
  constructor(private http: httpService, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: { payload: integration, mode: string },
  public dialogRef: MatDialogRef<SlackIntegrationSettingComponent>) { }

  ngOnInit() {
    this.getSlackChannels();
  }

  selectChannel(event: Select2UpdateEvent){
    this.channelID = event.value;
  }

  joinSlackChannel(){
    this.http.Get(`${urls.JOIN_SLACK_CHANNEL}/${this.channelID}`, null).subscribe((result: any) => {
      let config = this.data.payload.configurations;
      config['channelID'] = this.channelID;

      let entity = { name: "slack", configurations: config };
      this.http.Post(urls.UPDATE_INTEGRATION, null, entity).subscribe((result: any) => {
        this.dialogRef.close(true);
        NioApp.Toast(
          "<h5>Success</h5><p>Integration configurations has been saved successfully.</p>",
          "success",
          { position: 'bottom-left' }
        );
      })
    })
  }

  close(){
    this.dialogRef.close();
  }

  getSlackChannels(){
    this.http.Get(urls.LIST_SLACK_CHANNELS, null).subscribe((result: any) => {
      result.forEach((chanl: any) => {
        this.channels.push({
          id: chanl['id'],
          label: `#${chanl['name']}`,
          value: chanl['id']
        })
      });
      this.channelID = this.data.payload.configurations['channelID'];
    })
  }
}
