import { Injectable } from "@angular/core";
import { HttpClient , HttpHeaders  } from "@angular/common/http";
import { catchError, map } from "rxjs";
import { throwError } from 'rxjs';
declare var NioApp: any;

export class headersModel {
  headerName:string = '';
  headerContent:string = '';
}

@Injectable()
export class httpService  {

  constructor(private http: HttpClient) {

  }

  Get(url: string, params: any = null ,  headers: headersModel[] = []) {
    let requestUrl = this.GenerateUrl(url, params);
    let options = this.GenerateOptions(headers);

    return this.http
    .get(requestUrl, { headers: options })
    .pipe(
      map(res => {
        return res;
      }),
    );
  };

  Post(url: string, params: any = null , entity?: any, headers: headersModel[] = []) {
    let requestUrl = this.GenerateUrl(url, params);
    let options = this.GenerateOptions(headers);

    return this.http
      .post(requestUrl, entity, {headers : options})
      .pipe(
        map(res => {
          return res;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      )
  }

  Put(url: string, params: any = null , entity?: any, headers: headersModel[] = []) {
    let requestUrl = this.GenerateUrl(url, params);
    let options = this.GenerateOptions(headers);

    return this.http
      .put(requestUrl, entity, {headers : options})
      .pipe(
        map(res => {
          return res;
        })
      )
  }

  private GenerateUrl(url: string, params: any) {
    if(params != null){
      var requestUrl: string;
      if(url.includes("?")){
        requestUrl = `${url}&`;
      } else {
        requestUrl = `${url}?`;
      }

      for (const param in params) {
        if (params.hasOwnProperty(param)) {
          const value = params[param];
          requestUrl += `${param}=${value}&`;
        }
      }
      requestUrl = requestUrl.slice(0, -1);
      return requestUrl;
    } else {
      return url;
    }
  };

  private GenerateOptions(headers: headersModel[]): HttpHeaders {
    let request_headers = new HttpHeaders();
    if (headers != null) {
      headers.forEach(header => {
        request_headers = request_headers.set(header.headerName, header.headerContent);
      });
      return request_headers;
    } else {
      let request_headers = new HttpHeaders();
      return request_headers;
    }
  }

}
