// import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { Subscription } from 'rxjs'
import { MyContentService } from '../../services/content-detail.service'
import { map } from 'rxjs/operators'

/* tslint:disable */
import _ from 'lodash'
import { LocalDataService } from '../../services/local-data.service'
// import { NsAppToc } from '../../interface/app-toc.model'
import { MyTocService } from '../../services/my-toc.service'
import { PipeDurationTransformPipe, ValueService } from '@sunbird-cb/utils'
import { IAtGlanceComponentData, ITable } from '@sunbird-cb/collection'
import { NSContent } from '../../../../interface/content'
import { IAuthoringPagination } from '../../../../interface/authored'
import { LoaderService } from '../../../../services/loader.service'
import { AccessControlService } from '../../../../services/access-control.service'
import { ProfileV2Service } from '../../../../services/home.servive'
import { environment } from 'src/environments/environment'
// import { AuthInitService } from '../../../../services/init.service'
/* tslint:enable */

@Component({
  selector: 'ws-auth-content-detail',
  templateUrl: './content-detail.component.html',
  styleUrls: ['./content-detail.component.scss'],
  providers: [PipeDurationTransformPipe],
})
export class ContentDetailComponent implements OnInit, OnDestroy {
  public sideNavBarOpened = true
  newDesign = true
  tableData!: ITable
  // currentFilter = 'publish'
  // filterMenuTreeControl: FlatTreeControl<IMenuFlatNode>
  tocStructure: IAtGlanceComponentData.ICounts | null = null
  filterMenuTreeFlattener: any
  public cardContent!: any[]
  public contentId: string | null = null
  public content!: NSContent.IContentMeta
  public filters: any[] = []
  // public status = 'draft'
  public status = 'published'
  public fetchError = false
  contentType: string[] = []
  complexityLevel: string[] = []
  unit: string[] = []
  finalFilters: any = []
  allLanguages: any[] = []
  searchLanguage = ''
  public pagination!: IAuthoringPagination
  userId!: string
  totalContent!: number
  showLoadMore!: boolean
  routerSubscription = <Subscription>{}
  queryFilter = ''
  ordinals: any
  isAdmin = false
  currentAction: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  count: any = {}
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: any
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  public screenSizeIsLtMedium = false
  showKarmayogiLink!: boolean
  karmayogiLink = ''
  userRole = ''

  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
  >

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    // private authInitService: AuthInitService,
    // private durationPipe: PipeDurationTransformPipe,
    private valueSvc: ValueService,
    private dataService: LocalDataService,
    private myTocService: MyTocService,
    private homeResolver: ProfileV2Service
  ) {
    this.showKarmayogiLink = false
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor', 'cbc admin'])
  }

  ngOnDestroy() {
    if (this.routerSubscription.unsubscribe) {
      this.routerSubscription.unsubscribe()
    }
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
    this.loadService.changeLoad.next(false)
  }

  ngOnInit() {
    this.getUserDetails()
    this.pagination = {
      offset: 0,
      limit: 24,
    }
    // this.newDesign = this.accessService.authoringConfig.newDesign
    // this.ordinals = this.authInitService.ordinals
    // this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.activatedRoute.queryParams.subscribe(params => {
      this.status = params.status || 'published'
      this.setAction()
      this.fetchContent()
    })
  }

  getUserDetails() {
    this.homeResolver.getUserDetails().subscribe((res: any) => {
      if (res.roles && res.roles.length > 0) {
        Object.keys(res.roles).forEach((key: any) => {
          const objVal = res.roles[key]
          if (objVal === 'Member') {
            this.userRole = 'Member'
            this.showKarmayogiLink = true
            this.karmayogiLink = `${environment.karmYogiPath}/app/toc/${this.contentId}/overview`
          }
        })
      }
    })
  }
  changeToDefaultImg($event: any) {
    $event.target.src = '/assets/instances/eagle/app_logos/default.png'
  }
  fetchStatus() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
        return ['Draft']
      case 'inreview':
        return ['InReview', 'Reviewed', 'QualityReview']
      case 'review':
        return ['InReview']
      case 'published':
      case 'expiry':
        return ['Live']
      case 'publish':
        return ['Reviewed']
      case 'processing':
        return ['Processing']
      case 'unpublished':
        return ['Unpublished']
      case 'deleted':
        return ['Deleted']
    }
    return ['Draft']
  }
  resetAndFetchTocStructure() {
    this.tocStructure = {
      assessment: 0,
      course: 0,
      handsOn: 0,
      interactiveVideo: 0,
      learningModule: 0,
      other: 0,
      pdf: 0,
      podcast: 0,
      quiz: 0,
      video: 0,
      webModule: 0,
      webPage: 0,
      youtube: 0,
    }
    if (this.content) {
      this.tocStructure.learningModule = this.content.contentType === 'Collection' ? -1 : 0
      this.tocStructure.course = this.content.contentType === 'Course' ? -1 : 0
      this.tocStructure = this.myTocService.getTocStructure(this.content, this.tocStructure)
      // for (const progType in this.tocStructure) {
      //   if (this.tocStructure[progType] > 0) {
      //     break
      //   }
      // }
    }
  }

  getGlanceData(): IAtGlanceComponentData.IData | null {

    if (this.contentId && this.content && this.tocStructure) {
      return {
        displayName: 'At a glance', // now not using JSON
        contentId: '',
        contentType: this.content.contentType,
        cost: this.content.exclusiveContent ? 'Paid' : 'Free',
        duration: (this.content.duration || '0').toString(),
        lastUpdate: this.content.lastUpdatedOn,
        counts: this.tocStructure,
        competencies: this.content.competencies,
        viewContentLink: this.karmayogiLink,
        userRole: (this.userRole !== '') ? this.userRole : '',
      }
    }
    return null
  }
  parseJson(str: any) {
    try {
      return JSON.parse(str)
    } catch {
      return {}
    }
  }
  getAuthors(): any[] {
    if (this.content) {
      const lst = []
      const cc = this.parseJson(_.get(this.content, 'creatorContacts'))
      const curators = _.map(cc, i => {
        return {
          name: i.name,
          authorType: 'Curator',
        }
      })
      const cd = this.parseJson(_.get(this.content, 'creatorDetails'))
      const authors = _.map(cd, i => {
        return {
          name: i.name,
          authorType: 'Author',
        }
      })
      lst.push(...authors)
      lst.push(...curators)
      return lst
    }
    return []
  }
  setAction() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
      case 'inreview':
      case 'review':
      case 'published':
      case 'publish':
      case 'processing':
      case 'unpublished':
      case 'deleted':
        this.currentAction = 'author'
        break
      case 'expiry':
        this.currentAction = 'expiry'
        break
    }
  }
  actionClick(event: any) {
    if (event) {
      /* tslint:disable */
      console.log(event)
      /* tslint:enable */
    }
  }
  fetchContent() {
    this.contentId = this.activatedRoute.snapshot.paramMap.get('contentId') || null
    if (this.contentId) {
      this.myContSvc.readContent(this.contentId).subscribe(s => {
        _.set(this, 'content', s)
        this.dataService.initData(s)
        this.resetAndFetchTocStructure()
      })
    }
  }

  setCurrentLanguage(lang: string) {
    this.searchLanguage = lang
  }
}
