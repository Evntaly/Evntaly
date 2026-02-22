import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { httpService, urls } from '../../../core';
import confetti from 'canvas-confetti';

interface WalkthroughStep {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  gradientClass: string;
}

@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.component.html',
  styleUrls: ['./walkthrough.component.css']
})
export class WalkthroughComponent implements OnInit, OnDestroy {
  currentStepIndex = 0;
  isLoading = false;
  isVerifying = false;
  eventsReceived = false;
  showCurl = false;
  pollingInterval: any;
  copiedStates = {
    clientId: false,
    projectToken: false,
    integrationCode: false,
    curlCommand: false
  };

  onboardingData = {
    company_name: '',
    team_size: '',
    project_status: 'Development',
    project_name: '',
    project_type: '',
    use_case: ''
  };

  projectDetails = {
    clientId: '',
    projectToken: ''
  };
  selectedFramework = 'web';
  frameworks = [
    { id: 'web', name: 'Web', icon: 'assets/images/runtime/browser.png' },
    { id: 'angular', name: 'Angular', icon: 'assets/images/runtime/angular.svg' },
    { id: 'react', name: 'React', icon: 'assets/images/runtime/react.svg' },
    { id: 'nodejs', name: 'NodeJS', icon: 'assets/images/runtime/nodejs.svg' },
    { id: 'python', name: 'Python', icon: 'assets/images/runtime/python.svg' },
    { id: 'golang', name: 'GoLang', icon: 'assets/images/runtime/go-lang.png' }
  ];

  steps: WalkthroughStep[] = [
    {
      id: 'project-setup',
      title: 'Unified Developer Experience',
      subtitle: 'Centralize your events, integrations, and analytics in one powerful hub.',
      image: 'assets/images/evntaly-logo-context.png',
      color: '#00074E',
      gradientClass: 'gradient-welcome'
    },
    {
      id: 'integration',
      title: 'Real-Time Feed & Dashboards',
      subtitle: 'Stop waiting for batch jobs. Evntaly’s dashboards update in real-time, so you can act fast, ship smarter, and grow quicker.',
      image: 'assets/images/runtime/browser.png',
      color: '#11cdef',
      gradientClass: 'gradient-finish'
    },
    {
      id: 'verify',
      title: 'Built for Developers — Not Dashboards',
      subtitle: 'Forget bloated tools. Evntaly is fast, clean, and code-first — you own your events, your structure, and your insights.',
      image: 'assets/images/device/desktop.png',
      color: '#5e72e4',
      gradientClass: 'gradient-profile'
    },
    {
      id: 'finish',
      title: 'Track Anything, From Anywhere',
      subtitle: 'Whether it’s subscriptions, clicks, sessions, or purchases — Evntaly captures every event in real-time, with SDKs for web, mobile, and backend.',
      image: 'assets/images/Frame.png',
      color: '#11cdef',
      gradientClass: 'gradient-project'
    }
  ];

  constructor(
    private router: Router,
    private http: httpService
  ) {}

  ngOnInit(): void {
    const developerStr = window.localStorage.getItem('developer');
    if (developerStr) {
      const developer = JSON.parse(developerStr);

      if (developer.progress && developer.progress.is_onboarded) {
        this.finish();
        return;
      }

      if (developer.projects && developer.projects.length > 0) {
        this.onboardingData.project_name = developer.projects[0].name;
        this.projectDetails.clientId = developer.developer_secret || '';
        this.projectDetails.projectToken = developer.projects[0].tokens[0] || '';
      }

      const savedStepIndex = localStorage.getItem('walkthrough_step_index');
      if (savedStepIndex !== null) {
        const stepIndex = parseInt(savedStepIndex, 10);
        if (stepIndex >= 0 && stepIndex < this.steps.length) {
          this.currentStepIndex = stepIndex;

          if (this.steps[this.currentStepIndex].id === 'verify') {
            this.startPolling();
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get currentStep(): WalkthroughStep {
    return this.steps[this.currentStepIndex];
  }

  next(): void {
    this.stopPolling();

    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.saveStepIndex();

      if (this.steps[this.currentStepIndex].id === 'verify') {
        this.startPolling();
      }

      if (this.steps[this.currentStepIndex].id === 'finish') {
        this.triggerConfetti();
      }
    } else {
      this.finish();
    }
  }

  back(): void {
    this.stopPolling();
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.saveStepIndex();
    }
  }

  saveStepIndex(): void {
    localStorage.setItem('walkthrough_step_index', this.currentStepIndex.toString());
  }

  triggerConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  startPolling() {
    this.isVerifying = true;
    this.eventsReceived = false;
    this.pollingInterval = setInterval(() => {
      this.checkForEvents();
    }, 3000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isVerifying = false;
  }

  checkForEvents() {
    this.http.Post(`${urls.GET_EVENTS}`, { skip: 0, limit: 1 }, { criteria: {
      "metadata" : "",
      "tags" : [],
      "userKey" : "",
      "featureKey" : "",
      "topicKey" : "",
      "range" : "last 7 days",
      "status" : "New"
    } })
      .subscribe({
        next: (res: any) => {
          if (res && res.data && res.data.length > 0) {
            this.eventsReceived = true;
            this.stopPolling();
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  getCurlCommand(): string {
    const { clientId, projectToken } = this.projectDetails;
    return `curl -X POST https://app.evntaly.com/prod/api/v1/register/event \\
  -H 'Content-Type: application/json' \\
  -H 'secret: ${clientId}' \\
  -H 'pat: ${projectToken}' \\
  -d '{
    "title": "Hello, World! From Evntaly!",
    "description": "This is systemm generated event",
    "message": "You can easily delete it.",
    "data": {
      "license": "Onboarding",
      "onboarding_period": "14 Days",
      "is_onboarding": true
    }
  }'`;
  }

  submitProjectSetup(): void {
    if (!this.onboardingData.project_name || !this.onboardingData.project_type || !this.onboardingData.use_case) {
      return;
    }

    this.isLoading = true;

    this.updateProjectNameRequest().add(() => {
       this.isLoading = false;
       this.next();
    });
  }

  updateProjectNameRequest() {
    const developerStr = window.localStorage.getItem('developer');
    let projectID = '';
    if (developerStr) {
       const dev = JSON.parse(developerStr);
       if(dev.projects && dev.projects.length > 0) {
         projectID = dev.projects[0].projectID;
       }
    }

    if (projectID) {
      return this.http.Post(`${urls.UPDATE_PROJECT_NAME}/${projectID}`, null, { name: this.onboardingData.project_name })
      .subscribe({
        next: (res: any) => {
          this.refreshAccountDetails(false);
        },
        error: (err: any) => {
          console.error('Error updating project name', err);
        }
      });
    } else {
      return { add: (cb: any) => cb() } as any;
    }
  }

  refreshAccountDetails(navigate = true) {
    this.http.Get(`${urls.GET_ACCOUNT_DETAILS}`, null).subscribe({
      next: (result: any) => {
        const developerStr = window.localStorage.getItem('developer') || '{}';
        const developer = JSON.parse(developerStr);
        const { token, refreshToken } = developer;
        const updatedDeveloper = { ...result, token, refreshToken };
        window.localStorage.setItem('developer', JSON.stringify(updatedDeveloper));

        if (result.projects && result.projects.length > 0) {
            this.projectDetails.clientId = result.developer_secret || 'CLIENT_ID_HOLDER';
            this.projectDetails.projectToken = result.projects[0].tokens[0] || 'PROJECT_TOKEN_HOLDER';
        }

        if(navigate) {
            this.isLoading = false;
            this.next();
        }
      },
      error: () => {
        if(navigate) {
            this.isLoading = false;
            this.next();
        }
      }
    });
  }

  finish(): void {
    const developerStr = window.localStorage.getItem('developer');
    if (developerStr) {
      const developer = JSON.parse(developerStr);

      const updatedProgress = {
        ...(developer.progress || {}),
        is_onboarded: true
      };

      this.http.Post(urls.UPDATE_ACCOUNT_PROGRESS, null, updatedProgress).subscribe({
        next: (result: any) => {
          const updatedDeveloper = { ...developer, progress: result.progress || updatedProgress };
          window.localStorage.setItem('developer', JSON.stringify(updatedDeveloper));

          localStorage.removeItem('walkthrough_step_index');
          window.location.href = '/dashboard';
        },
        error: (err: any) => {
          console.error('Error updating account progress', err);
          localStorage.removeItem('walkthrough_step_index');
          window.location.href = '/dashboard';
        }
      });
    } else {
      localStorage.removeItem('walkthrough_step_index');
      window.location.href = '/dashboard';
    }
  }

  copyToClipboard(text: string, type: 'clientId' | 'projectToken' | 'integrationCode' | 'curlCommand' = 'integrationCode'): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedStates[type] = true;
      setTimeout(() => {
        this.copiedStates[type] = false;
      }, 2000);
    });
  }

  getIntegrationLanguage(): string {
    switch (this.selectedFramework) {
      case 'web': return 'xml';
      case 'angular': return 'typescript';
      case 'react': return 'javascript';
      case 'nodejs': return 'javascript';
      case 'python': return 'python';
      case 'golang': return 'go';
      default: return 'plaintext';
    }
  }

  getIntegrationCode(): string {
    const { clientId, projectToken } = this.projectDetails;
    switch (this.selectedFramework) {
      case 'angular':
        return `// npm install @evntaly/angular
import { Injectable } from '@angular/core';
import { EvntalySDKService } from 'evntaly-js';

@Injectable({ providedIn: 'root' })
export class EvntalyService {
  constructor(private readonly evntaly: EvntalySDKService) {
    this.evntaly.init('${clientId}', '${projectToken}');
  }

  trackEvent() {
    this.evntaly.track({
      title: 'Payment Received',
      description: 'User completed a purchase',
      message: 'Order #12345',
      icon: '💰'
    });
  }
}`;
      case 'web':
        return `<script async="true" src="./evntaly-web-v2.0.9.js"></script>

<script>
  window.evsq = window.evsq || [];
  window.evntaly = window.evntaly || ((...args) => window.evsq.push(args));
  window.evntaly("init", {
    clientID: "${clientId}",
    token: "${projectToken}",
    trackScreenViews: true,
    trackingEnabled: true
  });
</script>`;
      case 'react':
        return `// npm install evntaly-js
import React, { useEffect } from 'react';
import EvntalySDKService from 'evntaly-js';

const evntaly = new EvntalySDKService("${clientId}", "${projectToken}");

const ExampleComponent = () => {
useEffect(() => {
  evntaly.track({
    title: 'Payment Received',
    description: 'User completed a purchase',
    message: 'Order #12345',
    icon: '💰'
  });
}, []);

export default ExampleComponent;`;
      case 'nodejs':
        return `// npm install evntaly-js
const { EvntalySDKService } = require('evntaly-js');

const evntaly = new EvntalySDKService();
evntaly.init('${clientId}', '${projectToken}');`;
      case 'python':
        return `# pip install evntaly-python
from evntaly_python import EvntalySDK

evntaly = EvntalySDK("${clientId}", "${projectToken}")`;
      case 'golang':
        return `// go get github.com/Evntaly/evntaly-go
package main

import (
    "github.com/Evntaly/evntaly-go"
    "fmt"
)

func main() {
    evntaly := evntaly.NewEvntalySDK("${clientId}", "${projectToken}")
    fmt.Println("Evntaly SDK initialized!")
}`;
      default:
        return '// Select a framework to see integration code';
    }
  }
}
