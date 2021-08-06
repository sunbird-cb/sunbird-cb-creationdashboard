import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'

import { Subscription } from 'rxjs'
import { MyContentService } from '../../services/my-content.service'
import { map } from 'rxjs/operators'
import { PipeDurationTransformPipe, ValueService } from '@sunbird-cb/utils'

/* tslint:disable */
import _ from 'lodash'
// import { PipeContentTypePipe } from '@sunbird-cb/utils'
import { IAuthoringPagination, IFilterMenuNode, IMenuFlatNode } from '../../../../interface/authored'
import { LoaderService } from '../../../../services/loader.service'
// import { AuthInitService } from '../../../../services/init.service'
import { ILeftMenu, ITable } from '@sunbird-cb/collection'
/* tslint:enable */

const defaultFilter = [
  {
    key: 'contentType',
    value: [
      'Collection', 'Course', 'Learning Path',
    ],
  },
]
@Component({
  selector: 'ws-auth-all-content',
  templateUrl: './all-content.component.html',
  styleUrls: ['./all-content.component.scss'],
  providers: [PipeDurationTransformPipe],
})
export class AllContentComponent implements OnInit, OnDestroy {
  filterPath = '/app/home/cbp'
  public sideNavBarOpened = false
  public sideNavBarOpenedMain = true
  newDesign = true
  tableData!: ITable
  // currentFilter = 'publish'
  filterMenuTreeControl: FlatTreeControl<IMenuFlatNode>
  filterMenuTreeFlattener: any
  public cardContent!: any[]
  public filters: any[] = []
  // public status = 'draft'
  public status = 'published'
  public fetchError = false
  contentType: string[] = []
  complexityLevel: string[] = []
  unit: string[] = []
  finalFilters: any = defaultFilter
  allLanguages: any[] = []
  searchLanguage = ''
  public pagination!: IAuthoringPagination
  userId!: string
  myRoles!: Set<string>
  totalContent!: number
  showLoadMore!: boolean
  routerSubscription = <Subscription>{}
  queryFilter = ''
  departmentData: any
  ordinals: any
  isAdmin = false
  currentAction: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  count: any = {}
  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
  >
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: any
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  public screenSizeIsLtMedium = false
  leftmenues!: ILeftMenu
  public filterMenuItems: any = []
  configService!: any
  /* tslint:disable */
  resourses: any
  dataSource: any
  hasChild = (_: number, node: IMenuFlatNode) => node.expandable

  private _transformer = (node: IFilterMenuNode, level: number) => {
    return {
      expandable: !!node.content && node.content.length > 0,
      displayName: node.displayName,
      checked: node.checked,
      type: node.type,
      count: node.count,
      levels: level,
    }
  }
  /* tslint:enable */

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loadService: LoaderService,
    // private accessService: AccessControlService,
    // private authInitService: AuthInitService,
    // private durationPipe: PipeDurationTransformPipe,
    private valueSvc: ValueService,
  ) {
    this.configService = this.activatedRoute.parent
      && this.activatedRoute.parent.snapshot.data
      && this.activatedRoute.parent.snapshot.data.configService
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }
    if (this.configService) {
      this.departmentData = this.configService.unMappedUser.rootOrg
    }
    this.filterMenuTreeControl = new FlatTreeControl<IMenuFlatNode>(
      node => node.levels,
      node => node.expandable,
    )
    this.filterMenuTreeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.levels,
      node => node.expandable,
      node => node.content,
    )
    this.dataSource = new MatTreeFlatDataSource(
      this.filterMenuTreeControl,
      this.filterMenuTreeFlattener,
    )
    this.dataSource.data = this.filterMenuItems
    if (this.configService.userProfile) {
      this.userId = this.configService.userProfile.userId
    }
    // if (this.departmentData) {
    //   const leftData = this.authInitService.authAdditionalConfig.menus
    //   _.set(leftData, 'widgetData.logo', true)
    //   _.set(leftData, 'widgetData.logoPath', _.get(this.activatedRoute, 'snapshot.data.departmentData.data.logo'))
    //   _.set(leftData, 'widgetData.name', _.get(this.activatedRoute, 'snapshot.data.departmentData.data.deptName'))
    //   _.set(leftData, 'widgetData.userRoles', this.myRoles)
    //   this.leftmenues = leftData
    // } else {
    //   this.leftmenues = this.authInitService.authAdditionalConfig.menus
    // }
    this.isAdmin = this.hasRole(['admin', 'super-admin', 'content-admin', 'editor', 'content-creator', 'cbc admin'])
    this.initCardTable()

  }
  hasRole(role: string[]): boolean {
    let returnValue = true
    role.forEach(v => {
      if ((this.configService.userRoles || new Set()).has(v)) {
        returnValue = true
      }
    })
    return returnValue
  }
  initCardTable() {
    this.tableData = {
      columns: [
        {
          displayName: 'Course Name', key: 'name', isList: false, prop: '',
          link: { path: '/app/home/content-detail/', dParams: 'identifier' },
          defaultValue: 'Untitled Content',
          image: 'appIcon',
        },
        { displayName: 'Kind', key: 'contentType', isList: false, prop: '', defaultValue: 'NA' },
        // { displayName: 'Active users', key: 'uniqueUsersCount', isList: false, prop: '', defaultValue: 0 },
        { displayName: 'Duration', key: 'duration', defaultValue: 0, pipe: PipeDurationTransformPipe },
      ], //  :> this will load from json
      actions: [], // :> this will load from json
      needCheckBox: false,
      needHash: false,
      sortColumn: 'name',
      sortState: 'asc',
      actionsMenu: {
        headIcon: '',
        menus: [
          // { name: 'Edit', action: 'edit', disabled: false, icon: 'edit' },
          // { name: 'Delete', action: 'delete', disabled: false, icon: 'delete' },
        ],
        rowIcon: 'more_vert',
      },
    }
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
    this.pagination = {
      offset: 0,
      limit: 24,
    }
    this.newDesign = false
    // this.ordinals = this.authInitService.ordinals
    // this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(isLtMedium => {
      this.sideNavBarOpenedMain = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
    this.activatedRoute.queryParams.subscribe(params => {
      this.status = params.status || 'published'
      // this.setAction()
      this.fetchContent(false)
    })
  }

  createNewComponent() {
    this.router.navigate(['author', 'editor', 'new', 'collection'])
  }

  fetchStatus() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
        return ['Draft']
      case 'inreview':
        return ['InReview', 'QualityReview']
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

  fetchContent(loadMoreFlag: boolean, changeFilter = true) {
    const searchV6Data = this.myContSvc.getSearchBody(
      this.status,
      this.searchLanguage ? [this.searchLanguage] : [],
      loadMoreFlag ? this.pagination.offset : 0,
      this.queryFilter,
      this.isAdmin,
    )
    const requestData = {
      locale: this.searchLanguage ? [this.searchLanguage] : ['en'],
      query: this.queryFilter,
      request: {
        query: this.queryFilter,
        filters: {
          status: this.fetchStatus(),
          // creatorContacts: <string[]>[],
          // trackContacts: <string[]>[],
          // publisherDetails: <string[]>[],
          // isMetaEditingDisabled: [false],
          // isContentEditingDisabled: [false],
          // sourceName: [_.get(this.departmentData, 'data.deptName')],
          // createdFor: (this.configService.userProfile) ? [this.configService.userProfile.rootOrgId] : [],
        },
        // pageNo: loadMoreFlag ? this.pagination.offset : 0,
        sort_by: { lastUpdatedOn: 'desc' },
        // pageSize: this.pagination.limit,
        facets: [
          'primaryCategory',
          'mimeType',
        ],
      },
    }
    if (this.finalFilters.length) {
      this.finalFilters.forEach((v: any) => {
        searchV6Data.filters.forEach((filter: any) => {
          filter.andFilters[0] = {
            ...filter.andFilters[0],
            [v.key]: v.value,
          }
        })
        requestData.request.filters = { ...requestData.request.filters, [v.key]: v.value }
      })
    }

    this.loadService.changeLoad.next(true)
    const observable =
      this.status === 'expiry' || this.newDesign
        ? this.myContSvc.fetchFromSearchV6(searchV6Data, this.isAdmin).pipe(
          map((v: any) => {
            return {
              result: {
                response: v,
              },
            }
          }),
        )
        : this.myContSvc.fetchContent(requestData)
    this.loadService.changeLoad.next(true)
    observable.subscribe(
      data => {
        this.loadService.changeLoad.next(false)
        if (changeFilter) {
          this.filterMenuItems =
            data && data.result && data.result.facets
              ? data.result.facets
              : this.filterMenuItems
          this.dataSource.data = this.filterMenuItems
        }
        this.cardContent =
          loadMoreFlag && !this.queryFilter
            ? (this.cardContent || []).concat(
              data && data.result ? data.result.content : [],
            )
            : data && data.result.content
              ? data.result.content
              : []
        this.totalContent = data && data.result ? data.result.count : 0
        // const index = _.findIndex(this.count, i => i.n === this.status)
        // if (index >= 0) {
        this.count[this.status] = this.totalContent
        // }
        this.showLoadMore =
          this.pagination.offset * this.pagination.limit + this.pagination.limit < this.totalContent
            ? true
            : false
        this.fetchError = false
      },
      () => {
        this.fetchError = true
        this.cardContent = []
        this.showLoadMore = false
        this.loadService.changeLoad.next(false)
      },
    )
  }
  get getTableData(): any[] {
    if (this.cardContent && this.cardContent.length > 0) {
      return _.map(this.cardContent, i => {
        // const duration = this.durationPipe.transform(i.duration || 0, 'hms') || '0'
        // i.duration = duration
        return i
      })
    }
    return []
  }
  search() {
    if (this.searchInputElem.nativeElement) {
      this.queryFilter = this.searchInputElem.nativeElement.value.trim()
    }
    this.fetchContent(false, false)
  }

  filterApplyEvent(node: any) {
    this.pagination.offset = 0
    this.sideNavBarOpened = false
    const filterIndex = this.filters.findIndex(v => v.displayName === node.displayName)
    const filterMenuItemsIndex = this.filterMenuItems.findIndex((obj: any) =>
      obj.content.some((val: any) => val.type === node.type),
    )
    const ind = this.finalFilters.indexOf(this.filterMenuItems[filterMenuItemsIndex].type)
    if (filterIndex === -1 && node.checked) {
      this.filters.push(node)
      this.filterMenuItems[filterMenuItemsIndex].content.find(
        (v: any) => v.displayName === node.displayName,
      ).checked = true

      if (ind === -1) {
        this.finalFilters.push({
          key: this.filterMenuItems[filterMenuItemsIndex].type,
          value: [node.type],
        })
      } else {
        this.finalFilters[ind].value.push(node.type)
      }
    } else {
      this.filterMenuItems[filterMenuItemsIndex].content.find(
        (v: any) => v.displayName === node.displayName,
      ).checked = false
      this.filters.splice(filterIndex, 1)
      this.finalFilters.splice(ind, 1)
    }
    this.dataSource.data = this.filterMenuItems
    this.fetchContent(false, false)
  }

  clearAllFilters() {
    this.finalFilters = defaultFilter
    this.searchInputElem.nativeElement.value = ''
    this.queryFilter = ''
    this.filterMenuItems.map((val: any) => val.content.map((v: any) => (v.checked = false)))
    this.dataSource.data = this.filterMenuItems
    this.filters = []
    this.fetchContent(false)
  }

  loadMore() {
    this.pagination.offset += 1
    this.fetchContent(true, false)
  }

  setCurrentLanguage(lang: string) {
    this.searchLanguage = lang
  }
  get isAllowed() {
    return this.hasRole(['admin', 'super-admin', 'content-admin', 'editor', 'content-creator'])
  }
  isAllowedTab(roles: string[]) {
    if (roles && roles.length > 0) {
      return this.hasRole(roles)
    }
    return false
  }
}
