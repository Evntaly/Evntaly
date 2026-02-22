import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, Router, RouterStateSnapshot } from "@angular/router";
import { httpService } from "./http";
import { firstValueFrom } from "rxjs";
import { urls } from "../helpers/urls";

export class permissions {
  async canActivate(http: httpService) {
    try {
      let result = await firstValueFrom(http.Get(urls.IS_DEVELOPER_AUTHORISED));
      return result === true;
    } catch (error) {
      console.error('Error occurred while checking developer authorization:', error);
      // Handle the error, e.g., return a default value
      return false; // Assuming `false` indicates unauthorized when the service is down
    }
  }
}

@Injectable()
export class authGuard implements CanActivate {
  constructor(
    private permissions: permissions,
    private http: httpService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<GuardResult> {
    if (await this.permissions.canActivate(this.http)) {
      return true;
    } else {
      window.location.href = '/account/signin';
      return false;
    }
  }
}
