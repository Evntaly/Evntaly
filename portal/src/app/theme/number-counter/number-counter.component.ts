import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'evntaly-number-counter',
  template: `<span class="counter">{{ currentNumber }}</span>`,
  styleUrls: ['./number-counter.component.css'],
})
export class NumberCounterComponent implements OnInit, OnChanges {
  @Input() targetNumber: number = 0;
  currentNumber: number = 0;
  increment: number = 1;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['targetNumber']) {
      this.startCounter();
    }
  }

  startCounter() {
    this.currentNumber = 0;
    const interval = setInterval(() => {
      if (this.currentNumber < this.targetNumber) {
        this.currentNumber += this.increment;
        if (this.currentNumber > this.targetNumber) {
          this.currentNumber = this.targetNumber;
        }
      } else {
        clearInterval(interval);
      }
    }, 10);
  }
}
