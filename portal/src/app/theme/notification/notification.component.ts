import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'evntaly-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  @Input() message: string = "";
  @Input() status: "success" | "error" | "warning" | "info" = "success";

  constructor() { }

  ngOnInit() {
  }

}
