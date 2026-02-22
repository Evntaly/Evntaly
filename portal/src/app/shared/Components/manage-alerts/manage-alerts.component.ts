import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { alarmConfigurations, alert } from '../../models';
import { httpService, lookupsService, urls } from '../../../core';
declare var bootstrap: any;
declare var $: any;
declare var NioApp: any;
@Component({
  selector: 'evntaly-manage-alerts',
  templateUrl: './manage-alerts.component.html',
  styleUrls: ['./manage-alerts.component.css'],
})
export class ManageAlertsComponent implements OnInit {
  alertForm!: FormGroup;
  valueChangeSubscription: any;
  selectedAlarmType: any = '';
  urlPattern = '^(https?:\\/\\/)?' +
    '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$';
  error: string = '';

  constructor(
    private http: httpService, public dialogRef: MatDialogRef<ManageAlertsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private lookups: lookupsService) {
  }

  async ngOnInit() {
    this.alertForm = this.fb.group({
      occurances: [1, [Validators.required]],
      period: [null, [Validators.required, this.validateSelection]],
      integrationID: [null, [Validators.required, this.validateSelection]]
    });
  }

  validateSelection(control: any) {
    return control.value && control.value !== 'null' ? null : { 'invalidSelection': true };
  }

  createAlert() {
    console.log(this.alertForm.value)

    var new_alert = new alert();
    new_alert = this.alertForm.value;

    new_alert.alarm_configurations = new alarmConfigurations();
    new_alert.alarm_configurations!.send_alarm_on = this.alertForm!.value['alarm'] || "";
    new_alert.alarm_configurations!.webhook_url = this.alertForm!.value['webhook_url'] || "";

    if(this.data['parentEventID'] != undefined)
      new_alert.parentEventID = this.data['parentEventID'];

    if(this.data['userID'] != undefined)
      new_alert.userID = this.data['userID'];

    this.http.Post(urls.CREATE_ALERT_ON_EVENT, null, new_alert).subscribe((result) => {
      this.close(true);
    }, (error) => {
      console.log(error)
      this.error = error['error']['message'];
    })
  }

  close(result = false) {
    this.dialogRef.close(result);
  }
}
