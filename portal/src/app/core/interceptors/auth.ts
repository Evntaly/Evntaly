import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class authInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const developer = localStorage.getItem('developer') || '{}';
    const token = JSON.parse(developer)?.['token'];
    const demoMode = localStorage.getItem('demo_mode');

    let headers = req.headers;

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (demoMode === 'active') {
      headers = headers.set('DEMO_MODE', 'active');
    }

    const cloned = req.clone({
      headers: headers,
    });

    return next.handle(cloned);
  }
}
