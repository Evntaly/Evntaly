import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { httpService, lookupsService, urls } from '../../../../../core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
declare var NioApp: any;

@Component({
  selector: 'app-create-funnel',
  templateUrl: './create-funnel.component.html',
  styleUrls: ['./create-funnel.component.css']
})
export class CreateFunnelComponent implements OnInit {
  parentEvents: any[] = [];
  step1_event: any;
  step2_event: any;
  step3_event: any;
  steps: any[] = [];
  maxSteps: number = 5;

  funnelName: string = '';
  funnelDescription: string = '';

  constructor(
    private http: httpService, public dialogRef: MatDialogRef<CreateFunnelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private lookups: lookupsService) {
  }

  ngOnInit() {
    this.initializeSteps();
    this.getParentEventsList();
  }

  initializeSteps() {
    this.steps = [
      { stepNumber: 1, eventId: null },
      { stepNumber: 2, eventId: null },
      { stepNumber: 3, eventId: null }
    ];
  }

  addStep() {
    if (this.steps.length < this.maxSteps) {
      this.steps.push({
        stepNumber: this.steps.length + 1,
        eventId: null
      });
    }
  }

  syncLegacySteps() {
    this.step1_event = this.steps[0]?.eventId || null;
    this.step2_event = this.steps[1]?.eventId || null;
    this.step3_event = this.steps[2]?.eventId || null;
  }

  onStepChange() {
    this.syncLegacySteps();
  }

  canAddMoreSteps(): boolean {
    return this.steps.length < this.maxSteps;
  }

  isStepDisabled(stepIndex: number): boolean {
    if (stepIndex === 0) return false;

    for (let i = 0; i < stepIndex; i++) {
      if (!this.steps[i].eventId) {
        return true;
      }
    }
    return false;
  }

  getParentEventsList() {
    this.http
      .Get(`${urls.LIST_PIPELINE_EVENTS}`, null)
      .subscribe((result: any) => {

        let data = result['data'];

        data.forEach((event: any) => {
          this.parentEvents.push({
            id: event['parentEventID'],
            label: event['title'],
            value: event['parentEventID'],
          });
        });

        this.step1_event = data.find(
          (x: any) => x.is_key_event && x.key_event_order == 1
        )?.parentEventID;
        this.step2_event = data.find(
          (x: any) => x.is_key_event && x.key_event_order == 2
        )?.parentEventID;
        this.step3_event = data.find(
          (x: any) => x.is_key_event && x.key_event_order == 3
        )?.parentEventID;

        if (this.steps.length > 0) this.steps[0].eventId = this.step1_event;
        if (this.steps.length > 1) this.steps[1].eventId = this.step2_event;
        if (this.steps.length > 2) this.steps[2].eventId = this.step3_event;
      });
  }

  createFunnel(){
    const funnel = this.steps
      .filter(step => step.eventId)
      .map((step, index) => ({
        event_name: this.parentEvents.find(x => x.id == step.eventId)?.label,
        step_order: index + 1,
        // event_id: step.eventId
      }));

    if (funnel.length < 2) {
      NioApp.Toast(
        "<h5>Invalid Funnel Configuration</h5><p>Please configure at least 2 steps for your funnel.</p>",
        "error",
        { position: 'bottom-left' }
      );
      return;
    }

    let payload = {
      funnel_name: this.funnelName,
      steps: funnel,
      metadata: {
        created_by: 'system',
        tags: [],
        description: this.funnelDescription,
      }
    }

    this.http.Post(`${urls.CREATE_NEW_FUNNEL}`, null, payload).subscribe({
      next: (result: any) => {
        this.close();
        NioApp.Toast(
          "<h5>Funnel Created Successfully</h5><p>Your funnel has been configured with " + funnel.length + " steps.</p>",
          "success",
          { position: 'bottom-left' }
        );
      },
      error: (error) => {
        NioApp.Toast(
          "<h5>Error Creating Funnel</h5><p>Something went wrong. Please try again.</p>",
          "error",
          { position: 'bottom-left' }
        );
      }
    });
  }

  close(){
    this.dialogRef.close();
  }
}
