import { Injectable } from '@angular/core';
import { httpService } from './http';
import { urls } from '../helpers/urls';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class lookupsService {

  constructor(private http: httpService) { }

}
