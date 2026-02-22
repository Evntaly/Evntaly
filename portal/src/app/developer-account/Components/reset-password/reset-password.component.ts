import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { httpService, urls, SeoService } from '../../../core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  loading = false;
  password: string | undefined;
  confirm_password: string | undefined;
  showErrorMessage = false;
  showSuccess = false;
  errorMessage = '';
  showError = false;

  constructor(
    private route: ActivatedRoute,
    private http: httpService,
    private router: Router,
    private seoService: SeoService
  ) {
    this.token = this.route.snapshot.paramMap.get('token');
    this.seoService.setResetPasswordTitle();
  }

  ngOnInit() {
  }

  checkPasswords() {
    if (this.password !== this.confirm_password) {
      this.showErrorMessage = true;
      return false;
    }
    return true;
  }

  resetPassword(){
    this.loading = true;
    this.http.Post(`${urls.RESET_PASSWORD}`, null, {
      token: this.token,
      newPassword: this.password,
    }).subscribe({
      next: (result) => {
        this.loading = false;
        this.router.navigateByUrl('/account/signin');
      },
      error: (err) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = err.error.message;
      }
    });
  }
}
