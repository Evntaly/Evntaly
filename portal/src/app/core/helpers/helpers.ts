export class helpers {
  public static getEmojiDominantColor(emoji: any, alpha: number = 0.3): string | null {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    canvas.width = 64;
    canvas.height = 64;
    context.font = '48px sans-serif';
    context.fillText(emoji, 0, 48);

    const imageData = context.getImageData(0, 0, 64, 64);
    const data = imageData.data;

    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    if (count === 0) {
      return null;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  public static getRangeOfDates(numberOfDays: number) {
    const dates = [];
    for (let i = numberOfDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure the month is two digits
      const day = date.getDate().toString().padStart(2, '0'); // Ensure the day is two digits
      const formattedDate = month + '-' + day; // Formats date as "MM-DD"
      dates.push(formattedDate);
    }
    return dates;
  }

  public static getRangeOfDates2(value: number): string[] {
    const today = new Date();
    let result: string[] = [];

    if (value === 1) {
      for (let i = 1; i <= 24; i++) {
        result.push(i.toString().padStart(2, '0'));
      }
    } else if (value === -7) {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      for (
        let d = new Date(startOfWeek);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        result.push(
          d
            .toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\//g, '-')
        );
      }
    } else if (value === -30) {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      for (
        let d = new Date(startOfMonth);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        result.push(
          d
            .toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\//g, '-')
        );
      }
    } else if (value > 1) {
      for (let i = value - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        result.push(
          d
            .toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\//g, '-')
        );
      }
    }

    return result;
  }

  public static convertToTreeData(json: any): any[] {
    const convert = (obj: any): any[] => {
      return Object.keys(obj).map(key => {
        if (obj[key] === null) {
          return {
            text: `<span style='font-size:13px; font-weight: bold; font-family: Courier New; color: #bb3a3d;'>"${key}"</span>: <span style='font-style: italic; color: #999;'>null</span>`
          };
        }
        if (Array.isArray(obj[key])) {
          if (obj[key].length > 0 && typeof obj[key][0] === 'object') {
            return {
              text: `<strong>${key}</strong>`,
              state: { opened: false },
              children: obj[key].map((item: any, index: any) => ({
                text: '{}',
                state: { opened: false },
                children: convert(item)
              }))
            };
          } else {
            return {
              text: `<strong>${key}</strong>`,
              state: { opened: false },
              children: obj[key].map((item: any) => ({
                text: this.getColoredAttribute(item)
              }))
            };
          }
        } else if (typeof obj[key] === 'object') {
          return {
            text: `<strong>${key}</strong>`,
            state: { opened: false },
            children: convert(obj[key])
          };
        }
        return { text: `<span style='font-size:13px; font-weight: bold; font-family: Courier New; color: #bb3a3d;'>"${key}"</span>: ${this.getColoredAttribute(obj[key])}` };
      });
    };
    return [{
      text: `{ ${Object.keys(json).length} attributes }`,
      state: { opened: false },
      children: convert(json)
    }];
  }

  public static getColoredAttribute(value: any) {
    let color = 'black';
    if (typeof value === 'string') {
      color = '#177861';
    } else if (typeof value === 'number') {
      color = '#ff006a';
    } else if (typeof value === 'boolean') {
      color = '#000079';
    }

    return `<span style='font-size:13px; font-weight: bold; font-family: Courier New; color: ${color}'>"${value}"</span>`
  }

  public static timeAgo(date: string | number | Date){
    if(!date) return '';
    const time = Math.floor(
      (new Date().valueOf() - new Date(date).valueOf()) / 1000
    );
    const { interval, unit } = this.calculateTimeDifference(time);
    const suffix = interval === 1 ? '' : 's';
    return `${interval} ${unit}${suffix} ago`;
  };

  public static calculateTimeDifference(time: number) {
    const units = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    for (let { label, seconds } of units) {
      const interval = Math.floor(time / seconds);
      if (interval >= 1) {
        return {
          interval: interval,
          unit: label
        };
      }
    }
    return {
      interval: 0,
      unit: ''
    };
  };

  public static getTimezoneOffset() {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const sign = offset > 0 ? '-' : '+';
    return `${sign}${String(hours).padStart(2, '0')}`;
  }

  public static getQueryParams() {
    let qp: any = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      qp[key] = value;
    });

    return qp;
  }

  public static getTimeAgoBGColorForInsights(lastSeen: any): string {
    if (lastSeen.includes('minute') || lastSeen.includes('hour') || lastSeen.includes('second')) {
      return 'bg-success';
    } else if (lastSeen.includes('day') || lastSeen.includes('week')) {
      return 'bg-warning';
    } else if (lastSeen.includes('year') || lastSeen.includes('month')) {
      return 'bg-danger';
    }
    return '';
  };

  public static getInTableKPITextAndIcon(performance: any) {
    if (performance > 0) {
      return { bg : 'bg-success' , txt: 'Increased' };
    } else if (performance < 0) {
      return { bg : 'bg-danger' , txt: 'Decreased' };
    } else if (performance === 0) {
      return { bg : 'bg-light' , txt: 'Unchanged' };
    }
    return { bg: 'bg-light' , txt: 'No change' };
  };

  public static getRecordPerformanceColorAndIcon(value: any) {
    if (value <= -50) {
      return { bg : 'bg-danger-dim text-danger', icon: 'icon ni ni-arrow-down'};
    } else if (value <= -1 && value >= -49) {
      return { bg : 'bg-warning-dim text-warning' , icon: 'icon ni ni-arrow-down-right'};
    } else if (value === 0) {
      return { bg : 'bg-light text-primary' ,icon: 'icon ni ni-minus'};
    } else if (value > 0) {
      return { bg : 'bg-success-dim text-success' , icon: 'icon ni ni-arrow-up'};
    }
    return { bg : 'bg-light text-primary' ,icon: 'icon ni ni-minus'};
  };

  public static syntaxHighlight(object: any): string {
    let json = Object.assign({} , object);
    let jsonStr = JSON.stringify(json, undefined, 4);

    jsonStr = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return jsonStr.replace(/("(\\u[\dA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number jsonv';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key jsonv';
        } else {
          cls = 'string jsonv';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean jsonv';
      } else if (/null/.test(match)) {
        cls = 'null jsonv';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  public static getInitials(name: any) {
    if (!name) {
      return '';
    }
    const words = name.trim().split(' ');
    if (words.length === 0) {
      return '';
    }
    if (words.length === 1) {
      if (words[0].length === 0) {
        return '';
      }
      return words[0][0].toUpperCase();
    }
    const initials = words[0][0].toUpperCase() + words[1][0].toUpperCase();
    return initials;
  };

  public static getColorForInitial(initial: string) {
    const colorMap: { [key: string]: string } = {
        A: 'bg-danger',
        B: 'bg-success',
        C: 'bg-primary',
        D: 'bg-secondary',
        E: 'bg-info',
        F: 'bg-warning',
        G: 'bg-danger',
        H: 'bg-success',
        I: 'bg-primary',
        J: 'bg-secondary',
        K: 'bg-info',
        L: 'bg-warning',
        M: 'bg-danger',
        N: 'bg-success',
        O: 'bg-primary',
        P: 'bg-secondary',
        Q: 'bg-info',
        R: 'bg-warning',
        S: 'bg-danger',
        T: 'bg-success',
        U: 'bg-primary',
        V: 'bg-secondary',
        W: 'bg-info',
        X: 'bg-warning',
        Y: 'bg-info',
        Z: 'bg-success',
    };

    return colorMap[initial?.toUpperCase()]
  };

  public static flushCachedData() {
    window.localStorage.removeItem('developer');
    window.localStorage.removeItem('_projectID');
    window.localStorage.removeItem('projects');
    window.localStorage.removeItem('step_onboarding');
  };

  public static calculateDynamicInterval(maxValue: number): number {
    if (maxValue <= 0) return 1;
    if (maxValue <= 5) return 1;
    if (maxValue <= 10) return 2;
    if (maxValue <= 20) return 2;
    if (maxValue <= 50) return 10;
    if (maxValue <= 100) return 10;
    if (maxValue <= 500) return 100;
    if (maxValue <= 1000) return 200;

    // For larger numbers, round to nearest power of 10 divided by 2
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    return magnitude / 2;
  }

  public static getWebsiteLogo(domain: string): string {
    if (!domain || domain.toLowerCase() === 'direct' || domain.toLowerCase() === 'other') {
      return 'assets/images/runtime/browser.png';
    }

    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  }

  public static getBrowserLogo(browserName: string): string {
    if (!browserName) {
      return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg';
    }

    const name = browserName.toLowerCase().trim();

    // Map browser names to Devicons icon names (colored logos)
    // Edge uses a direct colored logo URL
    const browserIcons: { [key: string]: string } = {
      'chrome': 'chrome/chrome-original',
      'firefox': 'firefox/firefox-original',
      'safari': 'safari/safari-original',
      'edge': 'edge-special', // Special handling for Edge
      'opera': 'opera/opera-original',
      'brave': 'brave/brave-original',
      'ie': 'ie10/ie10-original',
      'internet explorer': 'ie10/ie10-original',
      'samsung': 'safari/safari-original',
      'samsung internet': 'safari/safari-original',
      'uc': 'chrome/chrome-original',
      'uc browser': 'chrome/chrome-original'
    };

    // Check exact matches first
    if (browserIcons[name]) {
      // Edge uses a colored logo - using a reliable source
      if (name === 'edge') {
        return 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg';
      }
      return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${browserIcons[name]}.svg`;
    }

    // Check partial matches
    for (const key in browserIcons) {
      if (name.includes(key)) {
        // Edge uses a colored logo - using a reliable source
        if (key === 'edge') {
          return 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg';
        }
        return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${browserIcons[key]}.svg`;
      }
    }

    // Default fallback to Chrome icon
    return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg';
  }

  public static getOSLogo(osName: string): string {
    if (!osName) {
      return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg';
    }

    const name = osName.toLowerCase().trim();

    // Map OS names to Devicons icon names (colored logos)
    const osIcons: { [key: string]: string } = {
      'windows': 'windows8/windows8-original',
      'win32': 'windows8/windows8-original',
      'macos': 'apple/apple-original',
      'mac os': 'apple/apple-original',
      'mac': 'apple/apple-original',
      'osx': 'apple/apple-original',
      'darwin': 'apple/apple-original',
      'ios': 'apple/apple-original',
      'ipados': 'apple/apple-original',
      'ipad': 'apple/apple-original',
      'android': 'android/android-original',
      'linux': 'linux/linux-original',
      'ubuntu': 'ubuntu/ubuntu-plain',
      'debian': 'debian/debian-plain',
      'fedora': 'fedora/fedora-original',
      'centos': 'centos/centos-original',
      'chrome os': 'chromeos/chromeos-original',
      'chromeos': 'chromeos/chromeos-original'
    };

    // Check exact matches first
    if (osIcons[name]) {
      return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${osIcons[name]}.svg`;
    }

    // Check partial matches
    for (const key in osIcons) {
      if (name.includes(key)) {
        return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${osIcons[key]}.svg`;
      }
    }

    // Default fallback to Linux icon
    return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg';
  }

  public static getDeviceTypeLogo(deviceName: string): string {
    return `assets/images/device/${deviceName.toLowerCase()}.png`;
  }

  public static getRuntimeLogo(runtimeName: string): string {
    if (!runtimeName) {
      return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg';
    }

    const name = runtimeName.toLowerCase().trim();

    // Map runtime names to Devicons icon names (colored logos)
    const runtimeIcons: { [key: string]: string } = {
      'angular': 'angularjs/angularjs-original',
      'react': 'react/react-original',
      'nodejs': 'nodejs/nodejs-original',
      'node.js': 'nodejs/nodejs-original',
      'node': 'nodejs/nodejs-original',
      'python': 'python/python-original',
      'golang': 'go/go-original',
      'go-lang': 'go/go-original',
      'go': 'go/go-original',
      'c#': 'dotnetcore/dotnetcore-original',
      'csharp': 'dotnetcore/dotnetcore-original',
      'dotnet': 'dotnetcore/dotnetcore-original',
      '.net': 'dotnetcore/dotnetcore-original',
      'flutter': 'flutter/flutter-original',
      'browser': 'javascript/javascript-original',
      'web': 'javascript/javascript-original'
    };

    // Check exact matches first
    if (runtimeIcons[name]) {
      return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${runtimeIcons[name]}.svg`;
    }

    // Check partial matches
    for (const key in runtimeIcons) {
      if (name.includes(key)) {
        return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${runtimeIcons[key]}.svg`;
      }
    }

    // Default fallback to JavaScript icon
    return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg';
  }
}
