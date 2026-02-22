import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'evntaly-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  currentYear: number = 0;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
  }

  openRoadmapModal() {
  }
}
