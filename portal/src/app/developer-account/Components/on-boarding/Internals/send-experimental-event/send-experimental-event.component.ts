import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { headersModel, httpService, urls } from '../../../../../core';

@Component({
  selector: 'send-experimental-event',
  templateUrl: './send-experimental-event.component.html',
  styleUrls: ['./send-experimental-event.component.css'],
})
export class SendExperimentalEventComponent implements OnInit {
  @Output() notify: EventEmitter<string> = new EventEmitter<string>();

  constructor(private http: httpService) {}

  ngOnInit() {}

  next() {
    let headers: headersModel[] = [
      {
        headerContent: JSON.parse(window.localStorage.getItem('developer')!)
          .developer_secret,
        headerName: 'secret',
      },
      {
        headerContent: JSON.parse(window.localStorage.getItem('developer')!)
          .projects[0].tokens[0],
        headerName: 'pat',
      },
    ];

    let data = {
      title: 'Hello, World! From Evntaly!',
      description:
        'This is systemm generated event, has been sent during the onboarding',
      message: 'You can easily delete it.',
      data: {
        license: 'Trial',
        trial_period: '14 Days',
        is_trial: true,
      },
      tags: ['Evntaly', 'Onboarding', 'first_event'],
      icon: '🚀',
      apply_rule_only: false,
      notify: true,
      feature: 'Onboarding',
      topic: '@evntaly-onboarding',
    };
    this.http
      .Post(urls.REGISTER_EXP_EVENT, null, data, headers)
      .subscribe((result) => {
        let developer = JSON.parse(window.localStorage.getItem('developer') || '{}');
        developer['progress']['is_onboarded'] = true;

        this.http.Post(urls.UPDATE_ACCOUNT_PROGRESS, null, developer.progress).subscribe((result: any) => {
          let developer = JSON.parse(localStorage.getItem('developer') || '{}');
          developer.progress = result.progress;

          window.localStorage.setItem('developer', JSON.stringify(developer));
          this.notify.emit('send_exp_event');
          window.location.reload();
        });
      });
  }

  updateAccountPorgression() {

  }
}
