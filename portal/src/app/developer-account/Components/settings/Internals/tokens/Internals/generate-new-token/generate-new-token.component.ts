import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { httpService, urls } from '../../../../../../../core';
declare var NioApp: any;

@Component({
  selector: 'app-generate-new-token',
  templateUrl: './generate-new-token.component.html',
  styleUrls: ['./generate-new-token.component.css'],
})
export class GenerateNewTokenComponent implements OnInit {
  projects: any[] = [];
  projectID: string = '';
  loading = false;

  constructor(
    private dialog: MatDialogRef<GenerateNewTokenComponent>,
    private http: httpService
  ) {}

  ngOnInit() {
    let prjs: any = window.localStorage.getItem('projects')
    this.projects = JSON.parse(prjs);
  }

  close(result = false) {
    this.dialog.close(result);
  }

  generateToken() {
    this.loading = true;
    if (this.projectID) {
      this.http
        .Get(`${urls.GENERATE_PAT_FOR_PROJECT}/${this.projectID}`, null)
        .subscribe((result: any) => {
          NioApp.Toast(
            '<h5>Token created</h5><p>PAT Token has been created successfully.</p>',
            'success',
            { position: 'bottom-left' }
          );

          this.loading = false;
          this.close(true);
        });
    }
  }
}
