import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-loading',
  templateUrl: './login-loading.component.html',
  styleUrls: ['./login-loading.component.css']
})
export class LoginLoadingComponent implements OnInit {
  result: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['data']) {
        try {
          this.result = JSON.parse(decodeURIComponent(params['data']));

          // Safe check for error property
          if (this.result && this.result.error && this.result.error.includes('oauth_email_exists')) {
            window.location.href = `/account/signin?oauth_email_exists=yes`;
            return;
          }

          if (this.result) {
            window.localStorage.setItem('developer', JSON.stringify(this.result));
            if (this.result.projects && this.result.projects.length > 0) {
              localStorage.setItem('_projectID', this.result.projects[0].projectID);
            }
            window.location.href = "/dashboard";
          }
        } catch (error) {
          console.error('Error parsing data:', error);
          window.location.href = '/account/signin';
        }
      }
    });
  }
}
