import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { helpers, httpService, urls } from '../../../../../core';
import { ConfirmationComponent } from '../../../../../theme/confirmation/confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class InformationComponent implements OnInit {
  timeZones: any[] = [];
  timezone: string = '';
  developerDetails!: any;
  loading = false;

  constructor(
    private http: httpService,
    private dialog: MatDialog,
    private scrollStrategyOptions: ScrollStrategyOptions
  ) {}

  ngOnInit() {
    this.populateTimezones();
    this.getAccountDetails();
  }

  populateTimezones() {
    const timezones = Intl.supportedValuesOf('timeZone');
    this.timeZones = [];

    timezones.forEach((timezone) => {
      this.timeZones.push({
        id: timezone,
        value: timezone,
        label: timezone,
      });
    });

    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  getAccountDetails() {
    this.http
      .Get(`${urls.GET_ACCOUNT_DETAILS}`, null)
      .subscribe((result: any) => {
        this.developerDetails = result;
        this.prepareDeveloperDetails(result);
      });
  }

  updateAccountDetails() {
    this.loading = true;
    const { name, email, timezone, team_size, company, location } =
      this.developerDetails;
    const payload = {
      account_owner_name: name,
      email,
      timezone,
      team_size,
      company_name: company,
      location,
    };
    this.http
      .Post(urls.UPDATE_ACCOUNT_SETTINGS, null, payload)
      .subscribe((result: any) => {
        this.loading = false;
        this.prepareDeveloperDetails(result);
      });
  }

  prepareDeveloperDetails(result: any) {
    const developer_tring = window.localStorage.getItem('developer') || '{}';
    const developer = JSON.parse(developer_tring);
    const { token, refreshToken } = developer;
    const updatedDeveloper = { ...result, token, refreshToken };
    window.localStorage.setItem('developer', JSON.stringify(updatedDeveloper));
  }

  deleteAccountConfirmation() {
    let message =
      'Are you sure you want to delete your account? This action is permanent and cannot be undone.';

    const dialogRef = this.dialog.open(ConfirmationComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: {
        header: 'Are you sure?',
        message: message,
        confirm_btn: `Yes, Delete my account`,
        cancel_btn: 'No, Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.deleteAccount();
    });
  }

  deleteAccount() {
    this.http
      .Post(`${urls.DELETE_ACCOUNT}`)
      .subscribe((result: any) => {
        // helpers.flushCachedData();
        window.location.href = '/account/signup';
      });
  }
}
