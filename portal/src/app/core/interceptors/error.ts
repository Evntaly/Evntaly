import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

declare var NioApp: any;

@Injectable()
export class errorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          const errorMessage = error.error?.message || 'Access forbidden. You do not have permission to perform this action.';
          NioApp.Toast(`<h5>${errorMessage}</h5>`, 'error', { position: 'bottom-left' });
        }
        return throwError(() => error);
      })
    );
  }
}

