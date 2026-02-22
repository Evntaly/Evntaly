import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'evntaly-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  developer: any = {};

  constructor(private router: Router) { }

  ngOnInit() {
    this.developer = JSON.parse(localStorage.getItem('developer') || '{}');
  }

  isDemo(): boolean {
    return localStorage.getItem('demo_mode') === 'active';
  }
}
