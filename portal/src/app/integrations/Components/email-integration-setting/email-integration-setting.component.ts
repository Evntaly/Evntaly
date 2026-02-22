import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { integration } from '../../models';
import { httpService, urls } from '../../../core';
import { HttpClient, HttpHandler } from '@angular/common/http';
declare var bootstrap: any;
declare var $: any;
declare var NioApp: any;

@Component({
  selector: 'app-email-integration-setting',
  templateUrl: './email-integration-setting.component.html',
  styleUrls: ['./email-integration-setting.component.css'],
})
export class EmailIntegrationSettingComponent implements OnInit {
  emailForm!: FormGroup;

  constructor(private http: httpService, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: { payload: integration, mode: string },
    public dialogRef: MatDialogRef<EmailIntegrationSettingComponent>) { }

  ngOnInit() {
    this.emailForm = this.fb.group({
      email_1: [null, [Validators.email, Validators.required]],
      email_2: [null, [Validators.email]],
      email_3: [null, [Validators.email]]
    });
    let config = this.data.payload.configurations;
    this.emailForm.setValue({ email_1: config['email_1'] || '', email_2: config['email_2'] || '', email_3: config['email_3'] || '' });
  }

  integrate() {
    let url = this.data.mode == 'create' ? urls.CREATE_INTEGRATION : urls.UPDATE_INTEGRATION;

    let entity = { name: "email", configurations: this.emailForm.value };
    this.http.Post(url, null, entity).subscribe((result: any) => {
      this.dialogRef.close(true);
      NioApp.Toast(
        "<h5>Success</h5><p>Integration configurations has been saved successfully.</p>",
        "success",
        { position: 'bottom-left' }
      );
    })
  }

  close() {
    this.dialogRef.close(false);
  }
}
