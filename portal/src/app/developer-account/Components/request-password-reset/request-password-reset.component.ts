import { Component, OnInit } from '@angular/core';
import { httpService, urls, SeoService } from '../../../core';
declare var NioApp: any;

@Component({
  selector: 'app-request-password-reset',
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.css']
})
export class RequestPasswordResetComponent implements OnInit {
  email: string | undefined;
  loading = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';

  constructor(private http: httpService, private seoService: SeoService) {
    this.seoService.setForgotPasswordTitle();
  }

  ngOnInit() {
  }

  sendRequestPasswordReset() {
    this.loading = true;
    this.http.Get(`${urls.REQUEST_PASSWORD_RESET}/${this.email}`, null).subscribe({
      next: (result) => {
        this.loading = false;
        this.showSuccess = true;
      },
      error: (err) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = err.error.message;
      }
    })
  }

}
