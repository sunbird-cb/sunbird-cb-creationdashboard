
import { DOCUMENT } from '@angular/common'
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
/* tslint:disable */
import _ from 'lodash'
import { environment } from '../../../../../../../../../src/environments/environment'
import { dashboardEmptyData } from "../../../../../../../../../src/cbc-assets/data/data"
import { ActivatedRoute } from '@angular/router'
/* tslint:enable */

@Component({
  selector: 'ws-app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss', './bootstrap-rain.scss'],
  /* tslint:disable-next-line */
  encapsulation: ViewEncapsulation.None,
  /* tslint:disable */
  host: { class: 'flex flex-1' },
  /* tslint:enable */
})

export class WelcomeComponent implements OnInit, AfterViewInit, OnDestroy {
  sliderData1!: any
  getDashboardForKM =
    '/apis/proxies/v8/dashboard/analytics/getDashboardConfig/Karmayogi'
  getDashboardForProfile =
    '/apis/proxies/v8/dashboard/analytics/getDashboardsForProfile/Karmayogi'
  getChartV2 =
    '/apis/proxies/v8/dashboard/analytics/getChartV2/Karmayogi'

  resolutionFilter = 'week'
  compFilter = 'table'
  showCBPLink = false
  showKarmayogiLink = false
  config!: any
  selectedDashboardId = ''
  currentDashboard: any = []
  dashboardEmpty = dashboardEmptyData

  constructor(@Inject(DOCUMENT) private document: Document, private activatedRoute: ActivatedRoute) {
    this.sliderData1 = {
      widgetType: 'slider',
      widgetSubType: 'sliderBanners',
      style: {
        'border-radius': '8px',
      },
      widgetData: [
        {
          banners: {
            l: 'assets/instances/eagle/cbc_welcome/CBC_banner_l.jpg',
            m: 'assets/instances/eagle/cbc_welcome/CBC_banner_m.jpg',
            s: 'assets/instances/eagle/cbc_welcome/CBC_banner_m.jpg',
            xl: 'assets/instances/eagle/cbc_welcome/CBC_banner_xl.jpg',
            xs: 'assets/instances/eagle/cbc_welcome/CBC_banner_m.jpg',
            xxl: 'assets/instances/eagle/cbc_welcome/CBC_banner_xl.jpg',
          },
        },
      ],
    }
    this.config = this.activatedRoute.parent && this.activatedRoute.parent.snapshot.data.configService
  }
  filterR(type: string) {
    this.resolutionFilter = type
  }
  filterComp(type: string) {
    this.compFilter = type
  }
  ngOnDestroy() {

  }
  ngOnInit() {
    this.getUserDetails()
    this.selectDashbord()
  }

  selectDashbord() {
    if (this.selectedDashboardId === '') {
      this.currentDashboard = []
      this.currentDashboard.push(this.dashboardEmpty)
    }
  }

  getUserDetails() {
    if (this.config.userRoles && this.config.userRoles.size > 0) {
      this.config.userRoles.forEach((key: any) => {
        const objVal = (key || 'public').toUpperCase()
        if (objVal === 'CONTENT_CREATOR' || objVal === 'EDITOR' || objVal === 'PUBLISHER' || objVal === 'REVIEWER') {
          this.showCBPLink = true
        }
        if (objVal === 'MEMBER') {
          this.showKarmayogiLink = true
        }
      })
    }
  }

  openky() {
    this.openNewWindow()
  }
  openNewWindow(): void {
    const link = this.document.createElement('a')
    link.target = '_blank'
    link.href = environment.karmYogiPath
    link.click()
    link.remove()
  }
  openCBP() {
    this.openNewWindowCBP()
  }
  openNewWindowCBP(): void {
    const link = this.document.createElement('a')
    link.target = '_blank'
    link.href = environment.cbpPath
    link.click()
    link.remove()
  }
  ngAfterViewInit() {
  }

  getDashboardId(value: string) {
    if (value && value !== null) {
      this.selectedDashboardId = value
    } else {
      this.currentDashboard = []
      this.currentDashboard.push(this.dashboardEmpty)
    }
  }
}
