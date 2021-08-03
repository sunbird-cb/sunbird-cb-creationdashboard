import { APP_BASE_HREF } from '@angular/common'
// import { retry } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { MatIconRegistry } from '@angular/material'
import { DomSanitizer } from '@angular/platform-browser'
import { BtnSettingsService } from '@sunbird-cb/collection'
import {
  hasPermissions,
  hasUnitPermission,
  NsWidgetResolver,
  WidgetResolverService,
} from '@sunbird-cb/resolver'
import {
  AuthKeycloakService,
  // AuthKeycloakService,
  ConfigurationsService,
  LoggerService,
  NsAppsConfig,
  NsInstanceConfig,
  // NsUser,
  UserPreferenceService,
} from '@sunbird-cb/utils'
import { map } from 'rxjs/operators'
import { environment } from '../../environments/environment'
/* tslint:disable*/
import _ from 'lodash'
/* tslint:enable*/
// interface IDetailsResponse {
//   tncStatus: boolean
//   roles: string[]
//   group: string[]
//   profileDetailsStatus: boolean
// }

interface IFeaturePermissionConfigs {
  [id: string]: Omit<NsWidgetResolver.IPermissions, 'feature'>
}

const endpoint = {
  profilePid: '/apis/proxies/v8/api/user/v2/read',
}

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private baseUrl = this.configSvc.baseUrl
  constructor(
    private logger: LoggerService,
    private configSvc: ConfigurationsService,
    private authSvc: AuthKeycloakService,
    private widgetResolverService: WidgetResolverService,
    private settingsSvc: BtnSettingsService,
    private userPreference: UserPreferenceService,
    private http: HttpClient,
    // private widgetContentSvc: WidgetContentService,

    @Inject(APP_BASE_HREF) private baseHref: string,
    // private router: Router,
    domSanitizer: DomSanitizer,
    iconRegistry: MatIconRegistry,
  ) {
    this.configSvc.isProduction = environment.production

    // Register pin icon for use in Knowledge Board
    // Usage: <mat-icon svgIcon="pin"></mat-icon>
    iconRegistry.addSvgIcon(
      'pin',
      domSanitizer.bypassSecurityTrustResourceUrl('cbc-assets/icons/pin.svg'),
    )
    iconRegistry.addSvgIcon(
      'facebook',
      domSanitizer.bypassSecurityTrustResourceUrl('cbc-assets/icons/facebook.svg'),
    )
    iconRegistry.addSvgIcon(
      'linked-in',
      domSanitizer.bypassSecurityTrustResourceUrl('cbc-assets/icons/linked-in.svg'),
    )
    iconRegistry.addSvgIcon(
      'twitter',
      domSanitizer.bypassSecurityTrustResourceUrl('cbc-assets/icons/twitter.svg'),
    )
    iconRegistry.addSvgIcon(
      'goi',
      domSanitizer.bypassSecurityTrustResourceUrl('cbc-assets/icons/emblem-dark.png'),
    )
    iconRegistry.addSvgIcon(
      'hubs',
      domSanitizer.bypassSecurityTrustResourceUrl('cbc-assets/icons/hubs.svg'),
    )
    iconRegistry.addSvgIcon(
      'karmayogi',
      domSanitizer.bypassSecurityTrustResourceUrl(`cbc-assets/icons/iGOT_symbol.svg`)
    )
  }

  async init() {
    // this.logger.removeConsoleAccess()
    await this.fetchDefaultConfig()
    // const authenticated = await this.authSvc.initAuth()
    // if (!authenticated) {
    //   this.settingsSvc.initializePrefChanges(environment.production)
    //   this.updateNavConfig()
    //   this.logger.info('Not Authenticated')
    //   return false
    // }
    // Invalid User
    try {
      await this.fetchStartUpDetails() // detail: depends only on userID
    } catch (e) {
      this.settingsSvc.initializePrefChanges(environment.production)
      this.updateNavConfig()
      this.logger.info('Not Authenticated')
      // window.location.reload() // can do this
      return false

    }
    try {
      // this.logger.info('User Authenticated', authenticated)
      const userPrefPromise = await this.userPreference.fetchUserPreference() // pref: depends on rootOrg
      this.configSvc.userPreference = userPrefPromise
      this.reloadAccordingToLocale()
      if (this.configSvc.userPreference.pinnedApps) {
        const pinnedApps = this.configSvc.userPreference.pinnedApps.split(',')
        this.configSvc.pinnedApps.next(new Set(pinnedApps))
      }
      if (this.configSvc.userPreference.profileSettings) {
        this.configSvc.profileSettings = this.configSvc.userPreference.profileSettings
      }
      // await this.fetchUserProfileV2()
      const appsConfigPromise = this.fetchAppsConfig()
      const instanceConfigPromise = this.fetchInstanceConfig() // config: depends only on details
      const widgetStatusPromise = this.fetchWidgetStatus() // widget: depends only on details & feature
      await this.fetchFeaturesStatus() // feature: depends only on details

      /**
       * Wait for the widgets and get the list of restricted widgets
       */
      const widgetConfig = await widgetStatusPromise
      this.processWidgetStatus(widgetConfig)
      this.widgetResolverService.initialize(
        this.configSvc.restrictedWidgets,
        this.configSvc.userRoles,
        this.configSvc.userGroups,
        this.configSvc.restrictedFeatures,
      )
      /**
       * Wait for the instance config and after that
       */
      await instanceConfigPromise
      /*
       * Wait for the apps config and after that
       */
      const appsConfig = await appsConfigPromise
      this.configSvc.appsConfig = this.processAppsConfig(appsConfig)
      if (this.configSvc.instanceConfig) {
        this.configSvc.instanceConfig.featuredApps = this.configSvc.instanceConfig.featuredApps.filter(
          id => appsConfig.features[id],
        )
      }

      // Apply the settings using settingsService
      this.settingsSvc.initializePrefChanges(environment.production)
      this.userPreference.initialize()
    } catch (e) {
      this.logger.warn(
        'Initialization process encountered some error. Application may not work as expected',
        e,
      )
      this.settingsSvc.initializePrefChanges(environment.production)
    }
    this.updateNavConfig()
    // await this.widgetContentSvc
    //   .setS3ImageCookie()
    //   .toPromise()
    //   .catch(() => {
    //     // throw new DataResponseError('COOKIE_SET_FAILURE')
    //   })
    return true
  }

  private reloadAccordingToLocale() {
    if (window.location.origin.indexOf('http://localhost:') > -1) {
      return
    }
    let pathName = window.location.href.replace(window.location.origin, '')
    const runningAppLang = this.locale
    if (pathName.startsWith(`//${runningAppLang}//`)) {
      pathName = pathName.replace(`//${runningAppLang}//`, '/')
    }
    const instanceLocales = this.configSvc.instanceConfig && this.configSvc.instanceConfig.locals
    if (Array.isArray(instanceLocales) && instanceLocales.length) {
      const foundInLocales = instanceLocales.some(locale => {
        return locale.path !== runningAppLang
      })
      if (foundInLocales) {
        if (
          this.configSvc.userPreference &&
          this.configSvc.userPreference.selectedLocale &&
          runningAppLang !== this.configSvc.userPreference.selectedLocale
        ) {
          let languageToLoad = this.configSvc.userPreference.selectedLocale
          languageToLoad = `\\${languageToLoad}`
          if (this.configSvc.userPreference.selectedLocale === 'en') {
            languageToLoad = ''
          }
          location.assign(`${location.origin}${languageToLoad}${pathName}`)
        }
      }
    }
  }

  private async fetchDefaultConfig(): Promise<NsInstanceConfig.IConfig> {
    const publicConfig: NsInstanceConfig.IConfig = await this.http
      .get<NsInstanceConfig.IConfig>(`${this.baseUrl}/host.config.json`)
      .toPromise()
    this.configSvc.instanceConfig = publicConfig
    this.configSvc.rootOrg = publicConfig.rootOrg
    this.configSvc.org = publicConfig.org
    // TODO: set one org as default org :: use user preference
    this.configSvc.activeOrg = publicConfig.org[0]
    this.configSvc.appSetup = publicConfig.appSetup
    return publicConfig
  }

  get locale(): string {
    return this.baseHref && this.baseHref.replace(/\//g, '')
      ? this.baseHref.replace(/\//g, '')
      : 'en'
  }

  private async fetchAppsConfig(): Promise<NsAppsConfig.IAppsConfig> {
    const appsConfig = await this.http
      .get<NsAppsConfig.IAppsConfig>(`${this.baseUrl}/feature/apps.json`)
      .toPromise()
    return appsConfig
  }

  private async fetchStartUpDetails(): Promise<any> {
    // let userRoles: string[] = []

    if (this.configSvc.instanceConfig && !Boolean(this.configSvc.instanceConfig.disablePidCheck)) {
      let completeProdata: any | null = null
      try {
        completeProdata = await this.http
          .get<any>(endpoint.profilePid)
          .pipe(map((res: any) => res.result.response))
          .toPromise()
      } catch (e) {
        this.configSvc.userProfile = null
        throw new Error('Invalid user')
      }
      if (completeProdata && completeProdata.roles && completeProdata.roles.length > 0 &&
        this.hasRole(completeProdata.roles)) {
        if (completeProdata) {
          this.configSvc.unMappedUser = completeProdata
          const profileV2 = _.get(completeProdata, 'profiledetails')
          this.configSvc.userProfile = {
            country: _.get(profileV2, 'personalDetails.countryCode') || null,
            email: completeProdata.email,
            givenName: completeProdata.firstName,
            userId: completeProdata.userId,
            firstName: completeProdata.firstName,
            lastName: completeProdata.lastName,

            // tslint:disable-next-line: max-line-length
            userName: `${completeProdata.firstName ? completeProdata.firstName : ' '}${completeProdata.lastName ? completeProdata.lastName : ' '}`,
            profileImage: completeProdata.thumbnail || _.get(profileV2, 'photo'),
            dealerCode: null,
            isManager: false,
            departmentName: completeProdata.channel,
          }
          this.configSvc.userProfileV2 = {
            userId: _.get(profileV2, 'userId'),
            email: _.get(profileV2, 'personalDetails.officialEmail'),
            firstName: _.get(profileV2, 'personalDetails.firstname'),
            surName: _.get(profileV2, 'personalDetails.surname'),
            middleName: _.get(profileV2, 'personalDetails.middlename'),
            departmentName: _.get(profileV2, 'employmentDetails.departmentName'),
            // tslint:disable-next-line: max-line-length
            userName: `${_.get(profileV2, 'personalDetails.firstname') ? _.get(profileV2, 'personalDetails.firstname') : ''}${_.get(profileV2, 'personalDetails.surname') ? _.get(profileV2, 'personalDetails.surname') : ''}`,
            profileImage: _.get(profileV2, 'photo'),
            dealerCode: null,
            isManager: false,
          }
        } else {
          // need to fix
        }
      } else {
        this.authSvc.logout()
      }

      const details = {
        group: [], profileDetailsStatus: completeProdata.profileDetailStatus, roles: (completeProdata.roles || [])
          .map((v: any) => v.toLowerCase()), tncStatus: !completeProdata.promptTnC,
      }
      this.configSvc.hasAcceptedTnc = details.tncStatus
      this.configSvc.profileDetailsStatus = details.profileDetailsStatus

      // const roledetails: IDetailsResponse = await this.http
      //   .get<IDetailsResponse>(endpoint.details).pipe(retry(3))
      //   .toPromise()

      this.configSvc.userGroups = new Set(details.group)
      this.configSvc.userRoles = new Set((details.roles || []).map((v: string) => v.toLowerCase()))
      return details
    } else {
      return { group: [], profileDetailsStatus: true, roles: new Set(['Public']), tncStatus: true }
      // if (this.configSvc.userProfile && this.configSvc.userProfile.isManager) {
      //   this.configSvc.userRoles.add('is_manager')
    }
  }

  private async fetchInstanceConfig(): Promise<NsInstanceConfig.IConfig> {
    // TODO: use the rootOrg and org to fetch the instance
    const publicConfig = await this.http
      .get<NsInstanceConfig.IConfig>(`${this.configSvc.sitePath}/site.config.json`)
      .toPromise()
    this.configSvc.instanceConfig = publicConfig
    this.configSvc.rootOrg = publicConfig.rootOrg
    this.configSvc.org = publicConfig.org
    this.configSvc.activeOrg = publicConfig.org[0]
    this.updateAppIndexMeta()
    return publicConfig
  }

  private async fetchFeaturesStatus(): Promise<Set<string>> {
    // TODO: use the rootOrg and org to fetch the features
    const featureConfigs = await this.http
      .get<IFeaturePermissionConfigs>(`${this.baseUrl}/features.config.json`)
      .toPromise()
    this.configSvc.restrictedFeatures = new Set(
      Object.entries(featureConfigs)
        .filter(
          ([_k, v]) => !hasPermissions(v, this.configSvc.userRoles, this.configSvc.userGroups),
        )
        .map(([k]) => k),
    )
    return this.configSvc.restrictedFeatures
  }
  private async fetchWidgetStatus(): Promise<NsWidgetResolver.IRegistrationsPermissionConfig[]> {
    const widgetConfigs = await this.http
      .get<NsWidgetResolver.IRegistrationsPermissionConfig[]>(`${this.baseUrl}/widgets.config.json`)
      .toPromise()
    return widgetConfigs
  }

  private processWidgetStatus(widgetConfigs: NsWidgetResolver.IRegistrationsPermissionConfig[]) {
    this.configSvc.restrictedWidgets = new Set(
      widgetConfigs
        .filter(u =>
          hasPermissions(
            u.widgetPermission,
            this.configSvc.userRoles,
            this.configSvc.userGroups,
            this.configSvc.restrictedFeatures,
          ),
        )
        .map(u => WidgetResolverService.getWidgetKey(u)),
    )
    return this.configSvc.restrictedWidgets
  }

  private processAppsConfig(appsConfig: NsAppsConfig.IAppsConfig): NsAppsConfig.IAppsConfig {
    const tourGuide = appsConfig.tourGuide
    const features: { [id: string]: NsAppsConfig.IFeature } = Object.values(
      appsConfig.features,
    ).reduce((map1: { [id: string]: NsAppsConfig.IFeature }, feature: NsAppsConfig.IFeature) => {
      if (hasUnitPermission(feature.permission, this.configSvc.restrictedFeatures, true)) {
        map1[feature.id] = feature
      }
      return map1
      // tslint:disable-next-line: align
    }, {})
    const groups = appsConfig.groups
      .map((group: NsAppsConfig.IGroup) => ({
        ...group,
        featureIds: group.featureIds.filter(id => Boolean(features[id])),
      }))
      .filter(group => group.featureIds.length)
    return { features, groups, tourGuide }
  }
  private updateNavConfig() {
    if (this.configSvc.instanceConfig) {
      const background = this.configSvc.instanceConfig.backgrounds
      if (background.primaryNavBar) {
        this.configSvc.primaryNavBar = background.primaryNavBar
      }
      if (background.pageNavBar) {
        this.configSvc.pageNavBar = background.pageNavBar
      }
      if (this.configSvc.instanceConfig.primaryNavBarConfig) {
        this.configSvc.primaryNavBarConfig = this.configSvc.instanceConfig.primaryNavBarConfig
      }
    }
  }

  private updateAppIndexMeta() {
    if (this.configSvc.instanceConfig) {
      document.title = this.configSvc.instanceConfig.details.appName
      try {
        if (this.configSvc.instanceConfig.indexHtmlMeta.description) {
          const manifestElem = document.getElementById('id-app-description')
          if (manifestElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (manifestElem as HTMLMetaElement).setAttribute(
              'content',
              this.configSvc.instanceConfig.indexHtmlMeta.description,
            )
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.webmanifest) {
          const manifestElem = document.getElementById('id-app-webmanifest')
          if (manifestElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (manifestElem as HTMLLinkElement).setAttribute(
              'href',
              this.configSvc.instanceConfig.indexHtmlMeta.webmanifest,
            )
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.pngIcon) {
          const pngIconElem = document.getElementById('id-app-fav-icon')
          if (pngIconElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (pngIconElem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.pngIcon
          }
        }
        if (this.configSvc.instanceConfig.indexHtmlMeta.xIcon) {
          const xIconElem = document.getElementById('id-app-x-icon')
          if (xIconElem) {
            // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
            ; (xIconElem as HTMLLinkElement).href = this.configSvc.instanceConfig.indexHtmlMeta.xIcon
          }
        }
      } catch (error) {
        this.logger.error('Error updating index html meta >', error)
      }
    }
  }

  hasRole(role: string[]): boolean {
    let returnValue = false
    const rolesForCBP = environment.portalRoles
    role.forEach(v => {
      if ((rolesForCBP).includes(v)) {
        returnValue = true
      }
    })
    return returnValue
  }
}
