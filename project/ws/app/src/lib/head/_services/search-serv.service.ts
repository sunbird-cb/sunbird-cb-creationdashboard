import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { NSSearch } from './widget-search.model'
import { ConfigurationsService, EventService, WsEvents } from '@sunbird-cb/utils'
import { Observable, of } from 'rxjs'
import { SearchApiService } from './search-api.service'
// import { IFilterUnitItem, IFilterUnitResponse, ISearchAutoComplete, ISearchQuery, ISearchRequestV2, ISearchSocialSearchPartialRequest,
// ISocialSearchRequest } from '../models/search.model'

const API_END_POINTS = {
  translateFiltersBase: '/apis/protected/v8/translate/filterdata',
  translateFilters: (lang: string) => `${API_END_POINTS.translateFiltersBase}/${lang}`,
}

@Injectable({
  providedIn: 'root',
})
export class SearchServService {
  progressHash: { [id: string]: number } = {}
  progressHashSubject: any
  isFetchingProgress = false
  searchConfig: any = null
  constructor(
    private events: EventService,
    // private contentApi: WidgetContentService,
    private searchApi: SearchApiService,
    private configSrv: ConfigurationsService,
    private http: HttpClient,
  ) { }

  get defaultFiltersTranslated() {
    return { en: {}, all: {} }
  }

  async getSearchConfig(): Promise<any> {
    if (!this.searchConfig) {
      this.searchConfig = {}
      const baseUrl = this.configSrv.sitePath
      this.searchConfig = await this.http.get<any>(`${baseUrl}/feature/search.json`).toPromise()
    }
    return of(this.searchConfig).toPromise()
  }

  async getApplyPhraseSearch(): Promise<boolean> {
    const config = await this.getSearchConfig()
    if (config.search.tabs[0].phraseSearch ||
      config.search.tabs[0].phraseSearch === undefined) {
      return true
    }
    return false
  }

  searchAutoComplete(params: any): Promise<any[]> {
    params.q = params.q.toLowerCase()
    // if (params.l.split(',').length === 1 && params.l.toLowerCase() !== 'all') {
    //   return this.searchApi.getSearchAutoCompleteResults(params).toPromise()
    // }
    return Promise.resolve([])
  }

  getLearning(request: any): Observable<NSSearch.ISearchV6ApiResultV2> {
    // request.locale = (request.locale && request.locale.length && request.locale[0] !== 'all') ? request.locale : []
    return this.searchV6Wrapper(request)
  }

  searchV6Wrapper(request: any): Observable<NSSearch.ISearchV6ApiResultV2> {
    const v6Request: NSSearch.ISearchV6RequestV2 = {
      request: {
        query: request.query,
        filters: request.filters,
        sort_by: {
          lastUpdatedOn: request.lastUpdatedOn,
        },
        facets: Object.keys(this.searchConfig.search.visibleFiltersV2),
        fields: request.fields,
      },
    }
    return this.searchApi.getSearch(v6Request)
  }
  fetchSocialSearchUsers(request: any) {
    const req: any = {
      org: this.configSrv.activeOrg,
      rootOrg: this.configSrv.rootOrg,
      ...request,
    }
    return this.searchApi.getSearchResults(req)
  }

  fetchSearchDataDocs(_request: any): Observable<any> {
    // return this.khubApiSvc.fetchSearchDataDocs(request)
    return '' as any
  }
  fetchSearchDataProjects(_request: any): Observable<any> {
    // return this.khubApiSvc.fetchSearchDataProject(request)
    return '' as any
  }

  updateSelectedFiltersSet(filters: { [key: string]: string[] }) {
    const valuesForSet: string[] = []
    let filtersResetAble = false
    Object.keys(filters || {}).forEach(key => {
      const unitFilters = filters[key]
      if (unitFilters.length > 0) {
        filtersResetAble = true
      }
      if (key.toLowerCase() === 'tags') {
        unitFilters.forEach((filterName: string) => {
          const filterNameSubParts = filterName.split('/')
          let filterNameSubPartConcatStr = ''
          for (const filterNameSubPartStr of filterNameSubParts) {
            filterNameSubPartConcatStr =
              filterNameSubPartConcatStr +
              (filterNameSubPartConcatStr.length ? '/' : '') +
              filterNameSubPartStr
            valuesForSet.push(filterNameSubPartConcatStr)
          }
        })
      } else {
        valuesForSet.push(...unitFilters)
      }
    })
    return {
      filterSet: new Set(valuesForSet),
      filterReset: filtersResetAble,
    }
  }

  transformSearchV6Filters(v6filters: NSSearch.ISearchV6Filters[]) {
    const filters: any = {}
    v6filters.forEach((f => {
      if (f.andFilters) {
        f.andFilters.forEach(andFilter => {
          Object.keys(andFilter).forEach(key => {
            filters[key] = andFilter[key]
          })

        })
      }
    }))
    return filters
  }

  handleFilters(
    filters: any[],
    selectedFilterSet: Set<string>,
    selectedFilters: { [key: string]: string[] },
    showContentType?: boolean,
  ) {

    let concepts: any[] = []
    const filtersResponse: any[] = filters
      .filter(unitFilter => {
        if (unitFilter.type === 'concepts') {
          concepts = unitFilter.content.slice(0, 10)
          return false
        }
        if (unitFilter.type === 'dtLastModified') {
          return false
        }
        if (showContentType !== undefined && showContentType && unitFilter.type === 'contentType') {
          return false
        }
        return true
      })
      .map(
        (unitFilter: any): any => ({
          ...unitFilter,
          checked:
            selectedFilters &&
            Array.isArray(selectedFilters[unitFilter.type]) &&
            Boolean(selectedFilters[unitFilter.type].length),
          content: unitFilter.content.map(
            (unitFilterContent: any): any => ({
              ...unitFilterContent,
              checked: selectedFilters &&
                Array.isArray(selectedFilters[unitFilter.type]) &&
                Boolean(selectedFilters[unitFilter.type].length) && selectedFilterSet.has(unitFilterContent.type || ''),
              children: !Array.isArray(unitFilterContent.children)
                ? []
                : unitFilterContent.children.map(
                  (unitFilterSecondLevel: any): any => ({
                    ...unitFilterSecondLevel,
                    children: [],
                    checked: selectedFilterSet.has(unitFilterSecondLevel.type || ''),
                  }),
                ),
            }),
          ),
        }),
      )
    return {
      concept: concepts,
      filtersRes: filtersResponse,
    }
  }

  // tslint:disable-next-line: prefer-array-literal
  setTilesDocs(response: Array<any>) {
    try {
      const tiles: any = []
      response.map((cur: any) => {
        const tile: any = {
          author: cur.authors || [],
          category: cur.category || '',
          description: cur.description || '',
          itemId: cur.itemId,
          itemType: cur.itemType || '',
          noOfViews: cur.noOfViews || 0,
          restricted: cur.isAccessRestricted || 'N',
          source: cur.source,
          title: cur.title || '',
          topics: cur.topics || [],
          url: cur.url || '',
          dateCreated: cur.dateCreated ? new Date(cur.dateCreated) : new Date(),
          color: cur.source.toLowerCase() === 'kshop' ? '3px solid #f26522' : '3px solid #28a9b2',
          sourceId: cur.sourceId || 0,
        }
        tiles.push(tile)
      })
      return tiles
    } catch (e) {
      throw e
    }
  }

  setTileProject(response: any) {
    try {
      const tilesProject: any = []
      response.map((cur: any) => {
        const tile: any = {
          pm: cur.pm || [],
          dm: cur.dm || [],
          objectives: cur.mstObjectives || '',
          risks: cur.risks || [],
          contribution: cur.contributions || [],
          category: 'Project',
          // description: '',
          projectScope: cur.mstProjectScope,
          businessContext: cur.mstBusinessContext,
          itemId: cur.itemId,
          restricted: cur.isAccessRestricted || 'N',
          source: 'PROMT',
          title: cur.mstProjectName || '',
          topics: cur.topics || [],
          url: '',
          dateCreated: new Date(cur.dateStartDate),
          color: '3px solid #e94a48',
          sourceId: 0,
        }
        tilesProject.push(tile)
      })
      return tilesProject
    } catch (e) {
      throw e
    }
  }

  formatKhubFilters(filters: { [key: string]: any }) {
    try {
      const returnArr: any[] = []
      for (const key in filters) {
        if (key) {
          const filterObj: any = {
            type: key,
            displayName: this.getDisplayName(key),
            content: this.fetchContentOfFilter(filters[key]),
          }
          returnArr.push(filterObj)
        }
      }
      return returnArr
    } catch (e) {
      throw e
    }
  }

  fetchContentOfFilter(filter: any) {
    const filterItemArr: any[] = []
    filter.map((cur: any) => {
      const obj = {
        count: cur.doc_count,
        displayName: cur.key,
        type: cur.key,
      }
      filterItemArr.push(obj)
    })
    return filterItemArr
  }
  formatFilterForSearch(filters: { [type: string]: string[] }) {
    try {
      let filterStr = ''
      const strArr: string[] = []
      for (const key in filters) {
        if (key) {
          let str = ''
          const count = filters[key].length
          filters[key].map((cur: string, i: number) => {
            if (i !== count - 1) {
              str += `"${cur}",`
            } else {
              str += `"${cur}"]`
            }
          })
          if (count > 0) {
            strArr.push(`"${key}":[${str}`)
          }
        }
      }
      filterStr = strArr.join('$')
      return filterStr
    } catch (e) {
      throw e
    }
  }

  getDisplayName(type: string) {
    let name = ''
    switch (type.toLowerCase()) {
      case 'automationcentral':
        name = 'Tools'
        break
      case 'autogeneratedtopic':
        name = 'Topics'
        break
      case 'topics':
        name = 'Topics'
        break
      case 'kshopdocument':
        name = 'Kshop Document'
        break
      case 'project':
        name = 'Project References'
        break
      case 'kshop':
        name = 'Documents'
        break
      case 'itemtype':
        name = 'Item Type'
        break
      case 'authors.mailid':
        name = 'Authors'
        break
      case 'mstlocation':
        name = 'Location'
        break
      case 'status':
        name = 'Project Status'
        break
      case 'marketing':
        name = 'Marketing'
        break
      default:
        name = type
        break
    }
    return name
  }

  getLanguageSearchIndex(lang: string): string {
    let name = ''
    switch (lang) {
      case 'zh-CN':
        name = 'zh'
        break
      default:
        name = lang
    }
    return name
  }

  raiseSearchEvent(query: string, filters: any, locale: any) {
    this.events.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Warn,
      data: {
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
        object: {
          query,
          filters,
          locale,
        },
        type: 'search',
      },
      from: 'search',
      to: 'telemetry',
    })
  }

  raiseSearchResponseEvent(query: string, filters: any, totalHits: number, locale: any) {
    this.events.dispatchEvent<WsEvents.IWsEventTelemetrySearch>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Warn,
      data: {
        query,
        filters,
        locale,
        eventSubType: WsEvents.EnumTelemetrySubType.Search,
        size: totalHits,
        type: 'search',
      },
      from: 'search',
      to: 'telemetry',
    })
  }

  async translateSearchFilters(lang: string): Promise<any> {
    const filtersTranslation = JSON.parse(localStorage.getItem('filtersTranslation') || JSON.stringify(this.defaultFiltersTranslated))
    if (lang.split(',').length === 1) {
      if (!filtersTranslation.hasOwnProperty(lang)) {
        filtersTranslation[lang] = {}
        localStorage.setItem('filtersTranslation', JSON.stringify(filtersTranslation))
        filtersTranslation[lang] = await this.http.get(API_END_POINTS.translateFilters(lang)).toPromise()
        localStorage.setItem('filtersTranslation', JSON.stringify(filtersTranslation))
      }
      return of(filtersTranslation[lang]).toPromise()
    }
    return of(filtersTranslation['en'] || {}).toPromise()

  }
}
