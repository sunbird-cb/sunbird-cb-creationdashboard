import { Injectable, SkipSelf } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { EMPTY, Observable, of } from 'rxjs'
import { ConfigurationsService } from '@sunbird-cb/utils'

@Injectable()
export class UserRoleResolve
  implements
  Resolve<Observable<any>> {
  constructor(@SkipSelf() private configService: ConfigurationsService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<any> {
    return of(this.configService.userRoles || EMPTY)
  }
}
