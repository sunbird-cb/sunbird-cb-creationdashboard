import { Injectable, LOCALE_ID, Inject } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { ConfigurationsService } from '@sunbird-cb/utils' // LoggerService
import { catchError } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class AppInterceptorService implements HttpInterceptor {
  constructor(
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    // private authSvc: AuthKeycloakService,
    // private logger: LoggerService,
    private route: Router,
    @Inject(LOCALE_ID) private locale: string,
  ) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const lang = [this.locale.replace('en-US', 'en')]
    if (this.configSvc.userPreference) {
      (this.configSvc.userPreference.selectedLangGroup || '')
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length)
        .forEach(locale => {
          if (!lang.includes(locale)) {
            lang.push(locale)
          }
        })
    }

    if (this.configSvc.activeOrg && this.configSvc.rootOrg) {
      const modifiedReq = req.clone({
        setHeaders: {
          org: this.configSvc.activeOrg,
          rootOrg: this.configSvc.rootOrg,
          locale: lang.join(','),
          wid: (this.configSvc.userProfile && this.configSvc.userProfile.userId) || '',
          hostPath: this.configSvc.hostPath,
        },
      })
      return next.handle(modifiedReq).pipe(
        catchError(error => {
          const localUrl = location.origin
          const pagePath = `/public/logout`
          // const pageName = (location.href || '').replace(localUrl, '')
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 0:
                if (localUrl.includes('localhost')) {
                  this.snackBar.open('Please login Again and Apply new TOKEN', undefined, { duration: 100 * 3 })
                }
                // this.authSvc.logout()
                this.route.navigate([pagePath])
                break
              case 200:
                if (!error.ok && error.url) {
                  window.location.href = error.url
                }
                break
              case 419:      // login
                if (localUrl.includes('localhost')) {
                  // tslint:disable-next-line: prefer-template
                  // window.location.href = pagePath
                  // this.route.navigate([pagePath])
                } else {
                  // tslint:disable-next-line: prefer-template
                  // window.location.href = error.error.redirectUrl + `?q=${pageName}`
                }
                this.route.navigate([pagePath])
                break
            }
          }
          return throwError('error')
        })
      )
    }
    return next.handle(req)
  }
}
