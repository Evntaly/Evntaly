import { Component, OnInit } from '@angular/core';
import { httpService, urls, SeoService } from '../../../core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  account: any = { email: '', password: '', timezone: '' };
  loading = false;

  constructor(private seoService: SeoService, private http: httpService, private router: Router) {
    this.seoService.setSignUpTitle();
   }

  ngOnInit() {
    this.account.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  createAccount(){
    this.loading = true;
    this.http.Post(urls.CREATE_ACCOUNT, null, this.account).subscribe((result: any) => {
      this.loading = false;
      let developer: any = JSON.stringify(result);
      window.localStorage.setItem('developer', developer);
      localStorage.setItem('_projectID', result?.projects[0].projectID);

      window.location.href = '/account/walkthrough';
    })
  }

  createAccountWithGithub(){
    window.location.href = urls.GITHUB_ACCESS;
  }

  createAccountWithGoogle(){
    window.location.href = urls.GOOGLE_ACCESS;
  }

  redierctToLogin(){
    this.router.navigate(['/account/signin']);
  }
}
