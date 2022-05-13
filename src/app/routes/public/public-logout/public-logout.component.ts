import { Component, OnInit, OnDestroy } from '@angular/core'
import { AuthKeycloakService, ConfigurationsService, NsPage } from '@sunbird-cb/utils'
import { Subscription } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'ws-public-logout',
  templateUrl: './public-logout.component.html',
  styleUrls: ['./public-logout.component.scss'],
})
export class PublicLogoutComponent implements OnInit, OnDestroy {
  contactUsMail = ''
  contactPage: any
  platform = 'Learner'
  panelOpenState = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  private subscriptionContact: Subscription | null = null

  constructor(
    private configSvc: ConfigurationsService,
    private activateRoute: ActivatedRoute,
    private authSvc: AuthKeycloakService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.subscriptionContact = this.activateRoute.data.subscribe(data => {
      this.contactPage = data.pageData.data
    })
    if (this.configSvc.instanceConfig) {
      this.contactUsMail = this.configSvc.instanceConfig.mailIds.contactUs
    }
    this.authSvc.force_logout().then(() => { })
  }

  ngOnDestroy() {
    if (this.subscriptionContact) {
      this.subscriptionContact.unsubscribe()
    }
  }
  login() {
    this.router.navigate(['protected', 'v8', 'resource'])
  }
}
