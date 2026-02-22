import { Component, OnInit } from '@angular/core';
import { httpService, urls } from '../../../../../core';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectComponent } from '../../../create-project/create-project.component';
import { ConfirmationComponent } from '../../../../../theme/confirmation/confirmation.component';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Clipboard } from '@angular/cdk/clipboard';

declare var NioApp: any;

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit {
  data: any[] = [];
  currentProjectID: string = '';

  constructor(
    private http: httpService,
    private dialog: MatDialog,
    private scrollStrategyOptions: ScrollStrategyOptions,
    private clipboard: Clipboard
  ) {}

  ngOnInit() {
    this.getListOfProjects();
    this.currentProjectID = localStorage.getItem('_projectID') || '';
  }

  selectProject(projectID: string) {
    this.data = this.data.map((project: any) => ({
      ...project,
      is_selected: project.projectID === projectID,
    }));

    localStorage.setItem('_projectID', projectID);
    window.location.reload();
  }

  getListOfProjects() {
    this.http
      .Get(`${urls.GET_ACCOUNT_PROJECTS_LIST}`, null)
      .subscribe((result: any) => {
        this.data = result;
      });
  }

  createNewProject() {
    const dialogRef = this.dialog.open(CreateProjectComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      exitAnimationDuration: 300,
      scrollStrategy: this.scrollStrategyOptions.noop(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.getListOfProjects();
    });
  }

  deleteProjectConfirmation(projectID: string) {
    let message =
      'Deleting this project will permanently remove all its related data, including events, features, topics, and users. This action is irreversible and cannot be undone.';

    const dialogRef = this.dialog.open(ConfirmationComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: {
        header: 'Are you sure you want to delete this project?',
        message: message,
        confirm_btn: `Yes, Delete the Project`,
        cancel_btn: 'No, Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.deleteProject(projectID);
    });
  }

  copyCodeToClipboard(projectID: string) {
    this.clipboard.copy(projectID);
    NioApp.Toast('<h5>Copied</h5>', 'info', { position: 'bottom-left' });
  }

  deleteProject(projectID: string) {
    this.http
      .Post(`${urls.DELETE_PROJECT}/${projectID}`)
      .subscribe((result: any) => {
        NioApp.Toast(
          '<h5>Project Deleted Successfully</h5><p>project and its has been removed.</p>',
          'success',
          { position: 'bottom-left' }
        );

        window.localStorage.removeItem('_projectID');
        this.getListOfProjects();
        window.location.reload();
      });
  }
}
