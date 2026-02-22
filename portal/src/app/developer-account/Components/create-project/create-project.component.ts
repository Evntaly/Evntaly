import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { httpService, urls } from '../../../core';
import { Router } from '@angular/router';

declare var NioApp: any;

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  projectName: string = '';

  constructor(private dialog: MatDialogRef<CreateProjectComponent>, private http: httpService,
    private readonly router: Router
  ) {}

  ngOnInit() {
  }

  createNewProject(){
    this.http.Post(`${urls.CREATE_NEW_PROJECT}`, null, { name: this.projectName }).subscribe((result: any) => {
      NioApp.Toast(
        "<h5>Project created</h5><p>Project has been created successfully.</p>",
        "success",
        { position: 'bottom-left' }
      );

      this.close(true);
      window.location.reload();
    })
  }

  close(result = false) {
    this.dialog.close(result);
  }
}
