import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { httpService, urls, SeoService } from '../../../core';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  account: any = { email: '', password: '' };
  loading = false;
  showError = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private http: httpService,
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {
    this.seoService.setSignInTitle();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      const hasOAuthEmailError = params && params['oauth_email_exists'] === 'yes';
      if (hasOAuthEmailError) {
        this.showError = true;
        this.errorMessage = 'This email is already associated with another account. Please sign in using your existing account.';
      }

      const demonstrate = params && params['demonstrate'];
      const secretKey = params && params['key'];

      if (demonstrate && secretKey && secretKey === 'sjidsyfgvyigsfdv') {
        this.account.email = 'demo@evntaly.com';
        this.account.password = 'Demo123!';
        this.signinAccount(true);
      }
    });
  }

  redierctToSignup(){
    this.router.navigate(['/account/signup']);
  }

  redierctToForgetPassword(){
    this.router.navigate(['/account/forget-password']);
  }

  signInAccountWithGithub(){
    window.location.href = urls.GITHUB_ACCESS;
  }

  signInAccountWithGoogle(){
    window.location.href = urls.GOOGLE_ACCESS;
  }

  signinAccount(isDemoMode: boolean = false){
    this.loading = true;
    this.http.Post(urls.SIGNIN_ACCOUNT, null, this.account).subscribe({
      next: (result: any) => {
        window.localStorage.setItem('developer', JSON.stringify(result));

        if (isDemoMode) {
          window.localStorage.setItem('demo_mode', 'active');
        }

        debugger
        console.log(result);
        this.loading = false;
        if(!result.progress || !result.progress.is_onboarded) {
          window.location.href = '/account/walkthrough';
        } else {
          window.location.href = '/dashboard';
        }
      },
      error: (err) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = err.error.message || 'Unable to connect to server. Please try again later.';
      }
    })
  }
}
