import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EChartsOption } from 'echarts';
import { urls } from '../../../../../core/helpers/urls';
import { httpService } from '../../../../../core';
import { MatDialog } from '@angular/material/dialog';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ConfirmationComponent } from '../../../../../theme/confirmation/confirmation.component';

declare var NioApp: any;
declare var html2canvas: any;
interface FunnelStep {
  name: string;
  count: number;
  dropOffPercentage?: number;
  isFirst: boolean;
}

@Component({
  selector: 'app-funnel-details',
  templateUrl: './funnel-details.component.html',
  styleUrls: ['./funnel-details.component.css']
})
export class FunnelDetailsComponent implements OnInit {
  selectedTimePeriod = 'Last 7 days';
  dates = [
    {text: 'Today' , is_active: true},
    {text: 'Yesterday' , is_active: false},
    {text: 'Last 7 days' , is_active: false},
    {text: 'Last 30 days' , is_active: false},
    {text: 'This week' , is_active: false},
    {text: 'This month' , is_active: false},
    {text: 'All time' , is_active: false},
  ];


  funnel: any = {};

  funnelKpis: any[] = [];

  funnelChartOptions: EChartsOption = {};

  @ViewChild('tooltip', { static: true }) tooltip!: ElementRef;

  constructor(private http: httpService, private route: ActivatedRoute,
    public dialog: MatDialog,
    private readonly router: Router,
    private scrollStrategyOptions: ScrollStrategyOptions,
  ) { }

  ngOnInit() {
    this.changeDateFilter(this.selectedTimePeriod);
    this.getFunnelDetails();
  }

  getFunnelDetails() {
    let id = this.route.snapshot.paramMap.get('id') || '';
    this.http.Get(`${urls.GET_FUNNEL_DETAILS}/${id}/${this.selectedTimePeriod}`).subscribe((res: any) => {
      this.funnel = res.data;
      this.initializeFunnelChart();
      this.getFunnelKPIs();
    });
  }

  getFunnelKPIs() {
    this.http.Get(`${urls.FUNNEL_KPIS}/${this.funnel._id}/${this.selectedTimePeriod}`).subscribe((res: any) => {
      this.funnelKpis = res.data.kpis;
    });
  }

  initializeFunnelChart() {
    const stepNames = this.funnel.funnelSteps.map((step: any) => step.name);
    const stepCounts = this.funnel.funnelSteps.map((step: any) => step.count);

    this.funnelChartOptions = {
      title: {
        show: false
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '15%',
        bottom: '20%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: '#374151',
          fontSize: 13
        },
        formatter: (params: any) => {
          const param = params[0];
          const stepIndex = param.dataIndex;
          const step = this.funnel.funnelSteps[stepIndex];
          const percentage = this.getStepPercentage(stepIndex);

          let tooltip = `<div style="font-weight: 700; margin-bottom: 10px; color: #111827; font-size: 14px;">${step.name}</div>`;
          tooltip += `<div style="margin-bottom: 6px; display: flex; justify-content: space-between;"><span>Step:</span> <strong>${stepIndex + 1}</strong></div>`;
          tooltip += `<div style="margin-bottom: 6px; display: flex; justify-content: space-between;"><span>Users:</span> <strong>${this.formatNumber(step.count)}</strong></div>`;
          tooltip += `<div style="margin-bottom: 6px; display: flex; justify-content: space-between;"><span>Conversion: &nbsp;</span> <strong>${percentage}%</strong></div>`;

          if (!step.isFirst && step.dropOffPercentage) {
            tooltip += `<div style="display: flex; justify-content: space-between;"><span>Drop-off:</span> <strong style="color: #dc2626;">${step.dropOffPercentage}%</strong></div>`;
          }

          return tooltip;
        },
        extraCssText: 'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);'
      },
      xAxis: {
        type: 'category',
        data: stepNames.map((name: any, index: any) => this.getAxisLabel(name, index)),
        axisLabel: {
          color: '#374151',
          fontSize: 11,
          fontWeight: 600,
          interval: 0,
          rotate: this.getRotationAngle(),
          margin: 15,
          lineHeight: 16
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e5e7eb',
            width: 1
          }
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          name: 'Users',
          type: 'bar',
          data: stepCounts.map((count: any, index: any) => ({
            value: count,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  { offset: 0, color: this.getFunnelStepColor(index) },
                  { offset: 1, color: this.getFunnelStepColorLight(index) }
                ]
              },
              borderRadius: [4, 4, 0, 0],
              shadowColor: 'rgba(0, 0, 0, 0.08)',
              shadowBlur: 8,
              shadowOffsetX: 0,
              shadowOffsetY: 4
            }
          })),
          barWidth: '90%',
          barMaxWidth: 120,
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              const percentage = this.getStepPercentage(params.dataIndex);
              return `Users: ${this.formatNumber(params.value)}\nConversion: ${percentage}%`;
            },
            fontSize: 12,
            fontWeight: 700,
            color: '#374151',
            distance: 8,
            lineHeight: 16
          },
          emphasis: {
            itemStyle: {
              shadowColor: 'rgba(0, 0, 0, 0.15)',
              shadowBlur: 12,
              shadowOffsetX: 0,
              shadowOffsetY: 6
            },
            label: {
              fontSize: 13,
              fontWeight: 800
            }
          }
        }
      ]
    };
  }

  getStepPercentage(index: number): number {
    const maxCount = this.funnel.funnelSteps[0].count;
    const currentCount = this.funnel.funnelSteps[index].count;
    if (!maxCount || isNaN(maxCount) || maxCount === 0) {
      return 0;
    }
    return Math.round((currentCount / maxCount) * 100);
  }

  getTooltipText(step: FunnelStep, index: number): string {
    let tooltip = `${step.name}\n`;
    tooltip += `Users: ${this.formatNumber(step.count)}\n`;
    tooltip += `Percentage: ${this.getStepPercentage(index)}%\n`;
    if (!step.isFirst) {
      tooltip += `Drop-off: ${step.dropOffPercentage}%`;
    }
    return tooltip;
  }

  getFunnelStepColor(index: number): string {
    const solidColors = [
      '#000B73',
      '#1A237E',
      '#303F9F',
      '#3949AB',
      '#5C6BC0',
      '#7986CB',
      '#9FA8DA',
      '#C5CAE9'
    ];

    return solidColors[index] || solidColors[index % solidColors.length];
  }

  getFunnelStepColorLight(index: number): string {
    const lightColors = [
      '#1A237E',
      '#303F9F',
      '#3949AB',
      '#5C6BC0',
      '#7986CB',
      '#9FA8DA',
      '#C5CAE9',
      '#E8EAF6'
    ];

    return lightColors[index] || lightColors[index % lightColors.length];
  }

  getRotationAngle(): number {
    const viewportWidth = window.innerWidth;

    if (viewportWidth <= 480) {
      return 45;
    } else if (viewportWidth <= 768) {
      return 30;
    } else {
      return 0;
    }
  }

  getAxisLabel(name: string, index: number): string {
    return `${name}`;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    setTimeout(() => {
      this.initializeFunnelChart();
    }, 100);
  }

  selectTimePeriod(period: string) {
    this.selectedTimePeriod = period;
  }

  changeDateFilter(selection: string){
    this.selectedTimePeriod = selection;
    this.dates.forEach(date => {
      date.is_active = false;
    });
    this.dates.find(date => date.text === selection)!.is_active = true;
    this.getFunnelDetails();
  }

  deleteFunnelConfirmation(){
    let message = 'This action is permenant and cannot be undone.';

    const dialogRef = this.dialog.open(ConfirmationComponent, {
      enterAnimationDuration: 0,
      disableClose: true,
      closeOnNavigation: true,
      scrollStrategy: this.scrollStrategyOptions.noop(),
      data: {
        header: 'Are you sure ?',
        message: message,
        confirm_btn : `Yes, Delete this funnel`,
        cancel_btn : 'No, Cancel',
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) this.deleteFunnel();
    })
  }

  deleteFunnel() {
    this.http.Get(`${urls.DELETE_FUNNEL}/${this.funnel._id}`).subscribe((result: any) => {

      NioApp.Toast(
        "<h5>Funnel Deleted Successfully</h5><p>Funnel has been removed.</p>",
        "success",
        { position: 'bottom-left' }
      );

             this.router.navigateByUrl('/analytics/funnels');
     })
   }

  shareFunnelDashboard() {
    if (typeof html2canvas === 'undefined') {
      this.loadHtml2Canvas().then(() => {
        this.downloadReport();
      }).catch(() => {
        NioApp.Toast(
          "<h5>Downloading Report Failed</h5><p>Enable to download report.</p>",
          "error",
          { position: 'bottom-left' }
        );
      });
    } else {
      this.downloadReport();
    }
  }

  private loadHtml2Canvas(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).html2canvas) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject();
      };
      document.head.appendChild(script);
    });
  }

  private downloadReport() {
    const element = document.getElementById('funnel-chart-screenshot');
    if (element) {
      NioApp.Toast(
        "<h5>Generating Report</h5><p>Please wait while we generate the report...</p>",
        "info",
        { position: 'bottom-left' }
      );

      (window as any).html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: element.offsetHeight,
        width: element.offsetWidth
      }).then((canvas: any) => {
        canvas.toBlob((blob: any) => {
          const link = document.createElement('a');
          link.download = `funnel-dashboard-${this.funnel.name || 'chart'}-${new Date().toISOString().split('T')[0]}.png`;
          link.href = URL.createObjectURL(blob);

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          NioApp.Toast(
            "<h5>Report Downloaded</h5><p>Funnel dashboard with chart and metrics has been downloaded to your device.</p>",
            "success",
            { position: 'bottom-left' }
          );
        }, 'image/png');
      }).catch((error: any) => {
        console.error('Error taking screenshot:', error);
        NioApp.Toast(
          "<h5>Downloading Report Failed</h5><p>Enable to download report.</p>",
          "error",
          { position: 'bottom-left' }
        );
      });
    }
  }
}
