import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  // ActivatedRoute,
} from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class EmptyRouteGuard implements CanActivate {
  constructor(
    private router: Router,
    private configSvc: ConfigurationsService,
  ) { }
  canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.configSvc.userProfile && this.configSvc.userProfile.userId) {
      return this.router.parseUrl('/app/home/welcome')
    }
    return false
  }
}
