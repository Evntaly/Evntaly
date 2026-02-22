import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
declare var NioApp: any;

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.css']
})
export class OnBoardingComponent implements OnInit, AfterViewInit {
  steps: any = {
    general_info : { show: false , next: 'app_and_tokens' },
    app_and_tokens : { show: false , next: 'sdk_integrations' },
    sdk_integrations: { show: false , next: 'send_exp_event'},
    send_exp_event: { show: false , next: null }
  }

  constructor(private dialog: MatDialogRef<OnBoardingComponent>) {

  }
  ngAfterViewInit(): void {
    NioApp.Stepper('.stepper-init');
  }

  ngOnInit() {
    Object.keys(this.steps).forEach((element: any) => {
      this.steps[element]['show'] = false;
    });

    let current = window.localStorage.getItem('step_onboarding')!;

    if(current) {
      let next = this.steps[current]['next'];
      this.steps[next]['show'] = true;
    }
    else {
      this.steps['general_info']['show'] = true;
    }
  }

  onNotify(component: string) {
    Object.keys(this.steps).forEach((element: any) => {
      this.steps[element]['show'] = false;
    });

    debugger
    let saved_compoent = this.steps[component];

    if(saved_compoent['next'] == null) this.dialog.close();

    this.steps[saved_compoent['next']]['show'] = true;
    window.localStorage.setItem('step_onboarding' , component);
  }

}
