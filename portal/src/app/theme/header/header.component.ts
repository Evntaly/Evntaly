import { Component, OnInit } from '@angular/core';
import { constants, helpers, httpService, urls } from '../../core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectComponent } from '../../developer-account/Components';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
declare var NioApp: any;

@Component({
  selector: 'evntaly-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  projects: any[] = [];
  projectName = '';
  developer: any = {};
  isMobile: boolean = false;

  constructor(private http: httpService, private router: Router,
    private dialog: MatDialog,
    private scrollStrategyOptions: ScrollStrategyOptions,) {}

  ngOnInit() {
    this.getListOfProjects();
    this.developer = JSON.parse(localStorage.getItem('developer') || '{}');
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  private checkMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  getListOfProjects() {
    this.http
      .Get(`${urls.GET_ACCOUNT_PROJECTS_LIST}`, null)
      .subscribe((result: any) => {
        window.localStorage.setItem('projects', JSON.stringify(result));
        const storedProjectID = localStorage.getItem('_projectID'); // Check if a projectID is already set
        this.projects = result.map((project: any) => {
          const isSelected = project.projectID === storedProjectID;

          if (isSelected) {
            localStorage.setItem('_projectID', project.projectID);
            this.projectName = project.name;
          }
          return {
            ...project,
            is_selected: isSelected,
          };
        });

        if (!storedProjectID && this.projects.length > 0) {
          this.projects[0].is_selected = true;
          this.projectName = this.projects[0].name;
          localStorage.setItem('_projectID', this.projects[0].projectID);
        }
      });
  }

  selectProject(projectID: string) {
    this.projects = this.projects.map((project: any) => ({
      ...project,
      is_selected: project.projectID === projectID, // Set selected project
    }));

    localStorage.setItem('_projectID', projectID);

    const redirectUrls = [
      '/insights/user-details',
      '/occurances/details',
      '/insights/parent-event-details',
    ];
    const currentUrl = window.location.pathname;
    if (redirectUrls.some((url) => currentUrl.startsWith(url))) {
      if (currentUrl.includes('user-details'))
        window.location.href = '/insights/users';
      if (currentUrl.includes('occurances/details'))
        window.location.href = '/occurances/all';
      if (currentUrl.includes('insights/parent-event-details'))
        window.location.href = '/insights/events';
    } else {
      location.reload();
    }
  }

  signout() {
    helpers.flushCachedData();
    window.location.href = '/account/signin';
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

  showDocs(){
    window.open('https://evntaly.gitbook.io/evntaly');
  }
}
