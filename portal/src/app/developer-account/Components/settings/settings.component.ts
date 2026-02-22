import { Component, OnInit } from '@angular/core';
import { httpService, urls, SeoService } from '../../../core';
import { Clipboard } from '@angular/cdk/clipboard';

declare var NioApp: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  accountDetails: any;
  constructor(
    private http: httpService,
    private clipboard: Clipboard,
    private seoService: SeoService
  ) {
    this.seoService.setSettingsTitle();
  }

  ngOnInit() {
    this.showAccountDetails();
  }

  showAccountDetails(){
    this.accountDetails = JSON.parse(window.localStorage.getItem('developer') || '{}');
  }

  copySecretToClipboard() {
    this.clipboard.copy(this.accountDetails?.developer_secret);
    NioApp.Toast('<h5>Copied</h5>', 'info', { position: 'bottom-left' });
  }
}
