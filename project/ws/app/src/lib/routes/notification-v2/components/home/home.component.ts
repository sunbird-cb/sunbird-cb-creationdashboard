import { Component, OnInit } from '@angular/core'
import { ConfigurationsService, NsPage, TFetchStatus } from '@sunbird-cb/utils'

import { NotificationApiService } from '../../services/notification-api.service'
import { ENotificationType, INotification } from '../../models/notifications.model'
import { NotificationService } from '../../services/notification.service'
import { noop } from 'rxjs'
import { Router } from '@angular/router'
import { LoaderService } from '../../../home/services/loader.service'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  showMarkAsRead = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  actionNotifications: INotification[]
  infoNotifications: INotification[]
  actionNotificationsFetchStatus: TFetchStatus
  infoNotificationsFetchStatus: TFetchStatus
  actionNotificationsNextPage?: string
  infoNotificationsNextPage?: string
  private pageSize: number

  constructor(
    private configSvc: ConfigurationsService,
    private notificationApi: NotificationApiService,
    private notificationSvc: NotificationService,
    private loadService: LoaderService,
    private router: Router,
  ) {
    this.pageSize = 5
    this.actionNotifications = []
    this.infoNotifications = []
    this.actionNotificationsFetchStatus = 'none'
    this.infoNotificationsFetchStatus = 'none'
  }

  ngOnInit() {

    this.fetchActionNotifications()
    this.fetchInfoNotifications()
  }

  fetchActionNotifications() {
    this.actionNotificationsFetchStatus = 'fetching'
    this.loadService.changeLoad.next(true)
    this.notificationApi
      .getNotifications(ENotificationType.Action, this.pageSize, this.actionNotificationsNextPage)
      .subscribe(
        notifications => {
          this.actionNotifications = this.actionNotifications.concat(notifications.data)
          this.actionNotificationsNextPage = notifications.page
          this.actionNotificationsFetchStatus = 'done'
        },
        () => {
          this.actionNotificationsFetchStatus = 'error'
          this.loadService.changeLoad.next(false)
        },
      )
  }

  fetchInfoNotifications() {
    this.infoNotificationsFetchStatus = 'fetching'
    this.notificationApi
      .getNotifications(
        ENotificationType.Information,
        this.pageSize,
        this.infoNotificationsNextPage,
      )
      .subscribe(
        notifications => {
          this.infoNotifications = this.infoNotifications.concat(notifications.data)
          this.infoNotificationsNextPage = notifications.page
          this.infoNotificationsFetchStatus = 'done'
          this.loadService.changeLoad.next(false)
        },
        () => {
          this.infoNotificationsFetchStatus = 'error'
          this.loadService.changeLoad.next(false)
        },
      )
  }

  onClickNotification(notification: INotification) {
    if (!notification.seen) {
      this.notificationApi
        .updateNotificationSeenStatus(notification.notificationId, notification.classifiedAs)
        .subscribe(() => {
          notification.seen = true
        },         noop)
    }

    this.notificationSvc.mapRoute(notification)
  }

  readAllNotifications() {
    this.notificationApi.updateNotificationSeenStatus().subscribe(_data => {
      this.router.navigate([], { queryParams: { ts: Date.now() } })
      this.showMarkAsRead = false
      this.actionNotifications.forEach((notification: INotification) => {
        notification.seen = true
      })
      this.infoNotifications.forEach((notification: INotification) => {
        notification.seen = true
      })
    })
  }
}
