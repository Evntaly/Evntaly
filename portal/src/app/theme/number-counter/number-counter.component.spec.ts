import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NumberCounterComponent } from './number-counter.component';

describe('NumberCounterComponent', () => {
  let component: NumberCounterComponent;
  let fixture: ComponentFixture<NumberCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumberCounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberCounterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display currentNumber in template', () => {
    component.currentNumber = 42;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('42');
  });

  it('should start at 0 when targetNumber changes', () => {
    component.targetNumber = 100;
    component.ngOnChanges({
      targetNumber: { currentValue: 100, previousValue: undefined, firstChange: true, isFirstChange: () => true },
    });
    expect(component.currentNumber).toBe(0);
  });
});
