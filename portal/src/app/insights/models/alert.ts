export class alert {
  constructor(){
    this.alarm_configurations = new alarmConfigurations();
  }

  _id?: string;
  parentEventID?: string;
  condition?: string = "";
  occurances?: number;
  period?: string;
  integrationID?: string;
  alarm_configurations?: alarmConfigurations;
}

export class alarmConfigurations {
  send_alarm_on?: string = "";
  webhook_url?: string = "";
}
