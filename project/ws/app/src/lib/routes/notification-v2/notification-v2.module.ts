import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatToolbarModule,
  MatDividerModule,
  MatButtonModule,
  MatRippleModule,
  MatIconModule,
  MatProgressSpinnerModule,
} from '@angular/material'

import { BtnPageBackModuleAdmin } from '@sunbird-cb/collection'

import { NotificationV2RoutingModule } from './notification-v2-routing.module'
import { HomeComponent } from './components/home/home.component'
import { NotificationService } from './services/notification.service'
import { NotificationApiService } from './services/notification-api.service'
import { NotificationEventComponent } from './components/notification-event/notification-event.component'
import { LoaderService } from '../home/services/loader.service'

@NgModule({
  declarations: [HomeComponent, NotificationEventComponent],
  imports: [
    CommonModule,
    NotificationV2RoutingModule,
    MatToolbarModule,
    MatDividerModule,
    MatButtonModule,
    MatRippleModule,
    MatIconModule,
    BtnPageBackModuleAdmin,
    MatProgressSpinnerModule,
  ],
  providers: [NotificationApiService, NotificationService, LoaderService],
})
export class NotificationV2Module { }
