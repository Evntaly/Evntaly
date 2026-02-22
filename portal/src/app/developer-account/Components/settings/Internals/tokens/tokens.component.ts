import { Component, OnInit } from '@angular/core';
import { httpService, urls } from '../../../../../core';
import { MatDialog } from '@angular/material/dialog';
import { GenerateNewTokenComponent } from './Internals';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Clipboard } from '@angular/cdk/clipboard';

declare var NioApp: any;

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.css'],
})
export class TokensComponent implements OnInit {
  data: any[] = [];
  loading = false;

  constructor(
    private http: httpService,
    private dialog: MatDialog,
    private scrollStrategyOptions: ScrollStrategyOptions,
    private clipboard: Clipboard
  ) {}

  ngOnInit() {
    this.getListOfTokens();
  }

  generateNewToken() {
    const dialogRef = this.dialog.open(GenerateNewTokenComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      exitAnimationDuration: 300,
      scrollStrategy: this.scrollStrategyOptions.noop(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.getListOfTokens();
    });
  }

  getListOfTokens() {
    this.http
      .Get(`${urls.LIST_PROJECTS_TOKENS}`, null)
      .subscribe((result: any) => {
        this.data = result;
        this.data.forEach((element) => {
          element['show'] = false;
        });
      });
  }

  showToken(index: number) {
    this.data[index].show = !this.data[index].show;
  }

  copyCodeToClipboard(projectID: string) {
    this.clipboard.copy(projectID);
    NioApp.Toast('<h5>Copied</h5>', 'info', { position: 'bottom-left' });
  }

  deleteToken(token: string, projectID: string) {
    this.loading = true;
    this.http
      .Get(`${urls.DELETE_PAT_FOR_PROJECT}/${token}/${projectID}`, null)
      .subscribe((result: any) => {
        NioApp.Toast(
          '<h5>Token Deleted</h5><p>PAT Token has been deleted successfully.</p>',
          'success',
          { position: 'bottom-left' }
        );

        this.loading = false;
        this.getListOfTokens();
      });
  }
}
