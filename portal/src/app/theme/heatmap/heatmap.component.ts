import { Component, Input, OnInit } from '@angular/core';


export interface heatMapOptions {
  type: 'range' | 'months' | 'month' | 'year';
  value?: number | string | string[];
}
@Component({
  selector: 'evntaly-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css'],
})
export class HeatmapComponent implements OnInit {
  @Input() mode: 'Horizontal' | 'Vertical' | string = '';
  @Input() action: string = '';
  @Input() theme: 'fire' | 'deepblue' | 'github' | string = '';
  @Input() data: any[] = [];
  @Input() options : {
    month?: string;
    months?: string[];
    range?: number;
    year?: boolean;
  } = {};


  heatmapData: any;
  heatmapDataYear: any[] = [];
  heatmap: { month: ''; days: any[] }[] = [];

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];


  constructor() {
  }

  ngOnInit() {
    this.heatmapData = this.generateHeatmap(this.options);
  }

  generateHeatmap(options: {
    month?: string;
    months?: string[];
    range?: number;
    year?: boolean;
  }) {
    if (options.year) {
      this.heatmapDataYear = this.buildHeatmapForYear();
    } else if (options.months) {
      this.heatmap = this.buildHeatmapForMonths(options.months);
    } else if (options.range) {
      this.heatmap = this.buildHeatmapForRange(options.range);
    } else if (options.month) {
      this.heatmap = this.buildHeatmapForSingleMonth(options.month);
    }
  }

  buildHeatmapForRange(range: number): any {
    switch (this.mode) {
      case 'Vertical':
        return this.buildHeatMapForRangeVertical(range);
      case 'Horizontal':
        return this.buildHeatMapForRangeHorizontal(range);
    }
  }

  buildHeatMapForRangeVertical(range: number) {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const heatmap: any[] = [];

    for (let i = 0; i < range; i++) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      const year = currentMonthIndex - i < 0 ? currentYear - 1 : currentYear;

      const month = this.months[monthIndex];
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      const monthData = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        const count = this.getCountForDate(date);

        monthData.push({
          day,
          dayOfWeek: date.getDay(),
          value: count,
          fullDate: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        });
      }

      heatmap.push({
        month,
        year,
        days: monthData,
      });
    }

    heatmap.reverse();
    return heatmap;
  }

  buildHeatMapForRangeHorizontal(range: number) {
    const months = this.getMonths();
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const heatmap = [];

    for (let i = 0; i < range; i++) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      const month = months[monthIndex];
      const monthData = this.buildDaysForMonth(month, this.data);
      heatmap.push({
        month,
        days: monthData,
      });
    }

    heatmap.reverse();
    return heatmap;
  }

  buildHeatmapForMonths(months: string[]) {
    switch (this.mode) {
      case 'Vertical':
        return this.buildHeatmapForMonthsVertical(months);
      case 'Horizontal':
        return this.buildHeatmapForMonthsHorizontal(months);
    }
  }

  buildHeatmapForMonthsVertical(s_months: string[]) {
    const year = new Date().getFullYear();
    const months = this.months;
    const heatmap: any = [];

    s_months.forEach((month) => {
      const monthIndex = months.indexOf(month);

      if (monthIndex !== -1) {
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        const monthData = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, monthIndex, day);
          const count = this.getCountForDate(date);

          monthData.push({
            day,
            dayOfWeek: date.getDay(),
            value: count,
            fullDate: date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
          });
        }

        heatmap.push({
          month,
          days: monthData,
        });
      }
    });

    return heatmap;
  }

  buildHeatmapForMonthsHorizontal(months: string[]) {
    const heatmap: any[] = [];

    months.forEach((month) => {
      const monthData = this.buildDaysForMonth(month, this.data);
      heatmap.push({
        month,
        days: monthData,
      });
    });

    return heatmap;
  }

  buildHeatmapForSingleMonth(month: string) {
    switch (this.mode) {
      case 'Vertical':
        return this.buildHeatmapForSingleMonthVertical(month);
      case 'Horizontal':
        return this.buildHeatmapForSingleMonthHorizontal(month);
    }
  }

  buildHeatmapForSingleMonthVertical(month: string) {
    const year = new Date().getFullYear();
    const months = this.months;
    const heatmap: any = [];

    const monthIndex = months.indexOf(month);

    if (monthIndex !== -1) {
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      const monthData = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        const count = this.getCountForDate(date);

        monthData.push({
          day,
          dayOfWeek: date.getDay(),
          value: count,
          fullDate: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        });
      }

      heatmap.push({
        month,
        days: monthData,
      });
    }

    return heatmap;
  }

  buildHeatmapForSingleMonthHorizontal(month: string) {
    const heatmap: any[] = [];
    const monthData = this.buildDaysForMonth(month, this.data);
    heatmap.push({
      month,
      days: monthData,
    });
    return heatmap;
  }

  buildHeatmapForYear(limitDate?: Date): any[] {
    const year = new Date().getFullYear();

    const limitMonth = limitDate ? limitDate.getMonth() : undefined;
    const limitDay = limitDate ? limitDate.getDate() : undefined;

    const heatmap: any = [];

    this.months.forEach((month, monthIndex) => {
      if (limitMonth !== undefined && monthIndex > limitMonth) {
        return;
      }

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      let actualLimit = daysInMonth;

      if (monthIndex === limitMonth) {
        actualLimit = Math.min(limitDay!, daysInMonth);
      }

      const monthData = [];
      for (let day = 1; day <= actualLimit; day++) {
        const date = new Date(year, monthIndex, day);
        const count = this.getCountForDate(date);

        monthData.push({
          date,
          dayOfWeek: date.getDay(),
          value: count,
          fullDate: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        });
      }

      heatmap.push({
        month,
        days: monthData,
      });
    });

    return heatmap;
  }

  getCountForDate(date: Date): number {
    const day = date.getDate();
    const month = date.getMonth() + 1;

    const dataItem = this.data.find((item) => {
      const itemDate = new Date(item._id);
      const itemDay = itemDate.getDate();
      const itemMonth = itemDate.getMonth() + 1;

      return itemDay === day && itemMonth === month;
    });

    return dataItem ? dataItem.count : 0;
  }

  buildDaysForMonth(month: string, data: any[], limitDay: number = 31) {
    const year = new Date().getFullYear();
    const daysInMonth = new Date(
      year,
      this.getMonthIndex(month) + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(`${month} 1, ${year}`).getDay();
    const daysArray = Array(firstDayOfMonth).fill(null);

    const dateMap = new Map();
    data.forEach((item) => {
      const date = new Date(item._id);
      const day = date.getDate();
      const month = date.getMonth() + 1;

      const key = `${month}-${day}`;
      dateMap.set(key, item.count);
    });

    const actualLimit = Math.min(limitDay, daysInMonth);

    for (let day = 1; day <= actualLimit; day++) {
      const key = `${this.getMonthIndex(month) + 1}-${day}`;
      const count = dateMap.has(key) ? dateMap.get(key) : 0;

      const dateObj = new Date(year, this.getMonthIndex(month), day);
      const formattedDay = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
      });
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
      });
      const formattedMonth = dateObj.toLocaleDateString('en-US', {
        month: 'long',
      });

      daysArray.push({
        day,
        value: count,
        fullDate: `${formattedDay}, ${formattedDate} ${formattedMonth}`,
      });
    }
    return daysArray;
  }

  getMonthIndex(month: string): number {
    const months = this.getMonths();
    return months.indexOf(month);
  }

  getMonths(): string[] {
    return [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
  }

  getTooltipText(day: { fullDate: any; value: any }): string {
    return `${day.value} ${this.action} on ${day.fullDate}`;
  }

  getHeatmapColor(value: number): string {
    if (value === 0) {
      return `${this.theme}-level-0`;
    } else if (value > 0 && value <= 5) {
      return `${this.theme}-level-1`;
    } else if (value > 5 && value <= 20) {
      return `${this.theme}-level-2`;
    } else if (value > 20 && value <= 50) {
      return `${this.theme}-level-3`;
    } else if (value > 50) {
      return `${this.theme}-level-4`;
    } else {
      return `${this.theme}-level-0`;
    }
  }
}
