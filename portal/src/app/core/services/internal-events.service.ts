import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InternalEventsService {
  private internalEventsSubject = new Subject<string>();

  internalEvent$ = this.internalEventsSubject.asObservable();

  emitEvent(event: string) {
    console.log(event);
    this.internalEventsSubject.next(event);
  }
}