export class constants {
  public static getOnBoardingCodeSnippet() {
    return [
      {
        lang: 'javascript',
        code: {
          installation: `npm install evntaly-js`,
          import: `import { EvntalySDKService } from 'evntaly-js';`,
          use: `this.evntaly.init('DEVELOPER_SECRET', 'PROJECT_TOKEN');

this.evntaly.track({
  title: 'Payment Received',
  description: 'User completed a purchase',
  message: 'Order #12345',
  icon: '💰'
});`,
        }
      },
      {
        lang: 'python',
        code: {
          installation: `pip install evntaly-python`,
          import: `from evntaly_python import EvntalySDK`,
          use: `evntaly = EvntalySDK("YOUR_DEVELOPER_SECRET", "YOUR_PROJECT_TOKEN")
evntaly.track({
    "title": "Payment Received",
    "description": "User completed a purchase",
    "message": "Order #12345",
    "icon": "💰"
})`
        }
      },
      {
        lang: 'go',
        code: {
          installation: `go get github.com/Evntaly/evntaly-go`,
          import: `import (
    "github.com/Evntaly/evntaly-go"
)`,
          use: `evntaly := evntaly.NewEvntalySDK("YOUR_DEVELOPER_SECRET", "YOUR_PROJECT_TOKEN")
event := evntaly.Event{
  Title:       "Payment Received",
  Description: "User completed a purchase",
  Message:     "Order #12345",
  Icon:        "💰",
}
err := evntaly.Track(event)`
        }
      },
      {
        lang: 'csharp',
        code: {
          installation: `dotnet add package EvntalySDK`,
          import: `using EvntalySDK;`,
          use: `var evntaly = new SDK("YOUR_DEVELOPER_SECRET", "YOUR_PROJECT_TOKEN");
var eventData = new Event
{
  Title = "Payment Received",
  Description = "User completed a purchase",
  Message = "Order #12345",
  Icon = "💰",
};
await evntaly.TrackEventAsync(eventData);`
        }
      }
    ]
  }

  public static eventBreakdownColors() {
    return [
      {
        type: "Debugging",
        color: "#CA1070"
      },
      {
        type: "Alert",
        color: "#A1CAFF"
      },
      {
        type: "Log",
        color: "#000B73"
      },
      {
        type: "Sign Up",
        color: "#FF7070"
      },
      {
        type: "Page View",
        color: "#10CA7A"
      },
      {
        type: "Purchase",
        color: "#FFB570"
      },
      {
        type: "API Request Received",
        color: "#CA10A7"
      },
      {
        type: "Job Queued",
        color: "#7AFF70"
      },
      {
        type: "Service Startup/Shutdown",
        color: "#7070FF"
      },
      {
        type: "Third-Party API Call",
        color: "#CA7010"
      },
      {
        type: "Security Alert",
        color: "#10A1FF"
      },
      {
        type: "Resource Usage Monitoring",
        color: "#CACA70"
      },
    ];
  }

  public static licenseStatus(): any {
    return {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      EXPIRED: 'Inactive',
      TERMINATED: 'Inactive',
      EXTENDED: 'Active',
    };
  }

  public static licenseStatusColor(): any {
    return {
      ACTIVE: 'success',
      INACTIVE: 'danger',
      EXPIRED: 'danger',
      TERMINATED: 'danger',
      EXTENDED: 'success',
    };
  }
}
