import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { httpService, urls } from '../../../../../core';

@Component({
  selector: 'general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.css']
})
export class GeneralInfoComponent implements OnInit {
  general_info : any = {
    project_status : "",
    company_name : "",
    team_size : "",
    location: ""
  };

  @Output() notify: EventEmitter<string> = new EventEmitter<string>();

  constructor(private http: httpService) { }

  ngOnInit() {
  }

  save(){
    console.log(this.general_info)
    this.http.Post(urls.UPDATE_ACCOUNT, null, this.general_info).subscribe((result: any) => {
      this.notify.emit('general_info');
    })
  }

  saved() {
    this.notify.emit('general_info');
  }

}
