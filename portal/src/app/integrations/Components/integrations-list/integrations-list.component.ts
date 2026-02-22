import { Component, OnInit } from '@angular/core';
import { helpers, httpService, urls, SeoService } from '../../../core';
import { integration } from '../../models';
import { MatDialog } from '@angular/material/dialog';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { EmailIntegrationSettingComponent } from '../email-integration-setting/email-integration-setting.component';
import { SlackIntegrationSettingComponent } from '../slack-integration-setting/slack-integration-setting.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-integrations-list',
  templateUrl: './integrations-list.component.html',
  styleUrls: ['./integrations-list.component.css']
})
export class IntegrationsListComponent implements OnInit {
  integrations_list: integration[] = [
    {
      name: 'Slack',
      icon: 'assets/images/slack.svg',
      status: 'NOT_CONFIGURED',
      updated_at: '',
      loading: false,
      configurations: {},
      action: () => {
        this.initSlackIntegration();
      },
      update: () => {
        this.openSlackIntegrationConfig('');
      }
    },
    {
      name: 'Webhook',
      icon: 'assets/images/webhook.svg',
      status: 'NOT_CONFIGURED',
      updated_at: '',
      loading: false,
      configurations: {},
      action: () => {
        return 1;
      }
    },
    {
      name: 'Email',
      icon: 'assets/images/gmail.svg',
      status: 'NOT_CONFIGURED',
      updated_at: '',
      loading: false,
      configurations: {},
      action: (mode: string) => {
        this.openEmailIntegrationConfig(mode);
      }
    },
    {
      name: 'Discord',
      icon: 'assets/images/discord.svg',
      status: 'IS_WIP',
      updated_at: '',
      loading: false,
      configurations: {},
      action: () => {
        return 1;
      }
    }
  ]

  constructor(
    private http: httpService,
    public dialog: MatDialog,
    private scrollStrategyOptions: ScrollStrategyOptions,
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {
    this.seoService.setIntegrationsTitle();
  }

  ngOnInit() {
    this.listIntegrations();
    this.checkIntegrationRedierctionSrc('slack');
  }

  listIntegrations(){
    this.http.Get(urls.LIST_INTEGRATIONS, null).subscribe((results: any) => {
      let incoming_integrations: integration[] = results;
      this.integrations_list.forEach((item) => {
        let current_integration = incoming_integrations.find(x => x.name!.toLowerCase() == item.name!.toLowerCase());
        if(current_integration != undefined){
          item.status = current_integration?.status;
          item.configurations = current_integration?.configurations
          item.updated_at = current_integration?.updatedAt || current_integration?.createdAt;
        }
      })
    })
  }

  openEmailIntegrationConfig(mode: string){
    let current_integration = this.integrations_list.find(x => x.name!.toLowerCase() == "email");

    const dialogRef = this.dialog.open(EmailIntegrationSettingComponent, {
      enterAnimationDuration: 0,
      disableClose: false,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: { mode: mode, payload: current_integration }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) this.listIntegrations();
    })
  }

  openSlackIntegrationConfig(mode: string){
    let current_integration = this.integrations_list.find(x => x.name!.toLowerCase() == "slack");

    const dialogRef = this.dialog.open(SlackIntegrationSettingComponent, {
      enterAnimationDuration: 0,
      disableClose: false,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: { mode: mode, payload: current_integration }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) this.listIntegrations();
    })
  }

  initSlackIntegration(){
    let current_integration = this.integrations_list.find(x => x.name!.toLowerCase() == "slack");

    if(current_integration?.status == 'NOT_CONFIGURED') {
      let client_id = '7663682153637.7905989770178';
      let scopes = 'channels:join,channels:read,chat:write,groups:read,im:read,mpim:read';
      let redirect_uri = `${environment.slackRedierctURL}/integrations/slack`;

      window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}`;
    } else if(current_integration?.status == 'ACTIVE') {
      this.openSlackIntegrationConfig('update');
    }
  }

  //#region Private helpers ..
  getStatusText(status: any) {
    let status_map: any = {
      "NOT_CONFIGURED": "Not Configured",
      "IN_ACTIVE": "Deactivated",
      "ACTIVE": "Active",
      "IS_WIP": "Coming Soon",
    }

    return status_map[status]
  }

  checkIntegrationRedierctionSrc(integraation_name: string) {
    let current_integration = this.integrations_list.find(x => x.name!.toLowerCase() == "slack")!;

    this.route.paramMap.subscribe(params => {
      let integration_src = params.get('src');
      if (integration_src == integraation_name) {
        current_integration.loading = true;
        let qs = helpers.getQueryParams();
        let entity = { name: "slack", configurations: { code: qs['code'] } };
        this.http.Post(urls.CREATE_INTEGRATION, null, entity).subscribe((result: any) => {
          current_integration.loading = false;
          this.listIntegrations();
          this.openSlackIntegrationConfig('create');
        })
      }
    });
  }
  //#endregion
}
