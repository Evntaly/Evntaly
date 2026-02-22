import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class projectSelectorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const _projectID = localStorage.getItem('_projectID');

    if (_projectID) {
      const cloned = req.clone({
        headers: req.headers.set('projectID', `${_projectID}`),
      });

      return next.handle(cloned);
    } else {
      return next.handle(req);
    }

  }
}
