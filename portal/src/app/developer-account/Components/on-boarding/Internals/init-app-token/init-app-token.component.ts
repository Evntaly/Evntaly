import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { httpService, urls } from '../../../../../core';
import { Clipboard } from '@angular/cdk/clipboard';

declare var NioApp: any;

@Component({
  selector: 'init-app-token',
  templateUrl: './init-app-token.component.html',
  styleUrls: ['./init-app-token.component.css']
})
export class InitAppTokenComponent implements OnInit {
  @Output() notify: EventEmitter<string> = new EventEmitter<string>();
  toggle_secret = "password";
  toggle_token = "password";
  projectName = '';
  projectID = '';
  account : any = {};

  constructor(private http: httpService, private clipboard: Clipboard) { }

  ngOnInit() {
    this.account = JSON.parse(window.localStorage.getItem('developer')!);

    this.projectName = this.account.projects[0].name;
    this.projectID = this.account.projects[0].projectID;
  }

  showOrHideInfo(controller: string){
    if(controller == 'secret') this.toggle_secret == 'password' ? 'text' : 'password';
  }

  updateProjectName(){
    this.http.Post(`${urls.UPDATE_PROJECT_NAME}/${this.projectID}`, null, { name: this.projectName })
    .subscribe({
      next: (result) => {
        this.getAccountDetails();
        NioApp.Toast(
          "<h5>Success</h5><p>Project Name Updated Successfully.</p>",
          "success",
          { position: 'bottom-left' }
        );
      },
      error: (err) => {
        NioApp.Toast(
          "<h5>Error</h5><p>Failed to update Project Name.</p>",
          "error",
          { position: 'bottom-left' }
        );
      }
    });
  }

  next() {
    this.notify.emit('app_and_tokens');
  }

  getAccountDetails() {
    this.http
      .Get(`${urls.GET_ACCOUNT_DETAILS}`, null)
      .subscribe((result: any) => {
        this.prepareDeveloperDetails(result);
      });
  }

  prepareDeveloperDetails(result: any) {
    const developer_tring = window.localStorage.getItem('developer') || '{}';
    const developer = JSON.parse(developer_tring);
    const { token, refreshToken } = developer;
    const updatedDeveloper = { ...result, token, refreshToken };
    window.localStorage.setItem('developer', JSON.stringify(updatedDeveloper));
  }


  copyToClipboard(txt: string) {
    this.clipboard.copy(txt);
    NioApp.Toast('<h5>Copied</h5>', 'info', { position: 'bottom-left' });
  }

}
