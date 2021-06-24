import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { CONTENT_READ, SEARCH, SEARCH_V6_ADMIN, SEARCH_V6_AUTH } from '../constants/apiEndpoints'
import { ApiService } from '../../../services/api.service'
import { NSApiResponse } from '../../../interface/apiResponse'
import { ISearchResult } from '../../../interface/search'
import { NSContent } from '../../../interface/content'
import { AccessControlService } from '../../../services/access-control.service'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINTS = {
  // https://d136953gtttd92.cloudfront.net/apis/protected/v8/user/mandatoryContent/checkStatus/60840612-6d85-4fe9-8c91-649ea093ea95
  MANDATORY_CONTENT: `${PROTECTED_SLAG_V8}/user/mandatoryContent/checkStatus`,
}
@Injectable()
export class MyContentService {
  constructor(
    private apiService: ApiService,
    private accessService: AccessControlService,
  ) { }

  fetchContent(searchData: any): Observable<any> {
    return this.apiService
      .post<NSApiResponse.ISearchApiResponse>(SEARCH, searchData)
      .pipe(map((data: NSApiResponse.IApiResponse<NSApiResponse.ISearchApiResponse>) => {
        return data
      }))
  }

  fetchFromSearchV6(searchData: any, forAdmin = false): Observable<ISearchResult> {
    return this.apiService.post<ISearchResult>(
      forAdmin ? SEARCH_V6_ADMIN : SEARCH_V6_AUTH,
      searchData,
    )
  }

  readContent(id: string): Observable<NSContent.IContentMeta> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${CONTENT_READ}${id}?mode=edit`,
    ).pipe(
      map((data: any) => {
        return data.result.content
      })
    )
  }

  getSearchBody(
    mode: string,
    locale: string[] = [],
    pageNo = 0,
    query = '*',
    forAdmin = false,
    pageSize = 24,
  ): any {
    const searchV6Body = {
      locale,
      pageSize,
      pageNo,
      query,
      filters: [
        {
          andFilters: [
            {
              status: <string[]>[],
              creatorContacts: undefined as any,
              trackContacts: undefined as any,
              publisherDetails: undefined as any,
              expiryDate: undefined as any,
            } as any,
          ],
        },
      ],
      visibleFilters: {
        learningMode: { displayName: 'Mode' },
        duration: { displayName: 'Duration' },
        contentType: { displayName: 'Content Type' },
        exclusiveContent: { displayName: 'Costs' },
        complexityLevel: { displayName: 'Level' },
        catalogPaths: { displayName: 'Catalog', order: [{ _key: 'asc' }] },
        sourceShortName: { displayName: 'Source' },
        resourceType: { displayName: 'Format' },
        region: { displayName: 'Region' },
        concepts: { displayName: 'Concepts' },
        lastUpdatedOn: { displayName: 'Last Updated' },
        creatorContacts: { displayName: 'Curators', order: [{ _key: 'asc' }] },
      },
      sort: undefined as any,
      uuid: this.accessService.userId,
      rootOrg: this.accessService.rootOrg,
    }
    if (mode === 'all') {
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      if (!forAdmin) {
        searchV6Body.filters[0] = {
          andFilters: [
            {
              creatorContacts: [this.accessService.userId],
              status: [
                'Draft',
                'InReview',
                'Reviewed',
                'Processing',
                'Live',
                'Deleted',
                'Unpublished',
                'QualityReview',
                'Expired',
                'MarkedForDeletion',
              ],
            },
          ],
        }
        searchV6Body.filters[1] = {
          andFilters: [{ trackContacts: [this.accessService.userId], status: ['InReview'] }],
        }
        searchV6Body.filters[2] = {
          andFilters: [{ publisherDetails: [this.accessService.userId], status: ['Reviewed'] }],
        }
      } else {
        searchV6Body.filters[0].andFilters[0].status = [
          'Draft',
          'InReview',
          'Reviewed',
          'Processing',
          'Live',
          'Deleted',
          'Unpublished',
          'QualityReview',
          'Expired',
          'MarkedForDeletion',
        ]
      }
    } else if (mode === 'expiry') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Live')
      searchV6Body.filters[0].andFilters[0].expiryDate = [
        {
          lte: this.accessService.convertToESDate(
            new Date(new Date().setMonth(new Date().getMonth() + 1)),
          ),
          gte: this.accessService.convertToESDate(new Date()),
        },
      ]
      searchV6Body.sort = [{ expiryDate: 'asc' }]
    } else if (mode === 'draft') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Draft')
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
    } else if (mode === 'inreview') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status = ['InReview', 'Reviewed', 'QualityReview']
    } else if (mode === 'published') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Live')
    } else if (mode === 'unpublished') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Unpublished')
    } else if (mode === 'deleted') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Deleted')
    } else if (mode === 'processing') {
      searchV6Body.filters[0].andFilters[0].creatorContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'desc' }]
      searchV6Body.filters[0].andFilters[0].status.push('Processing')
    } else if (mode === 'review') {
      searchV6Body.filters[0].andFilters[0].trackContacts = [this.accessService.userId]
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].status.push('InReview')
    } else if (mode === 'qualityReview') {
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].status.push('QualityReview')
    } else if (mode === 'publish') {
      searchV6Body.sort = [{ lastUpdatedOn: 'asc' }]
      searchV6Body.filters[0].andFilters[0].publisherDetails = [this.accessService.userId]
      searchV6Body.filters[0].andFilters[0].status.push('Reviewed')
    }
    if (forAdmin) {
      searchV6Body.filters[0].andFilters[0].publisherDetails = undefined
      searchV6Body.filters[0].andFilters[0].creatorContacts = undefined
      searchV6Body.filters[0].andFilters[0].trackContacts = undefined
    }
    if (query && query !== 'all' && query !== '*') {
      searchV6Body.sort = undefined
    }
    return searchV6Body
  }

  getUserCourseDetail() {
    return this.apiService.get<any>(
      API_END_POINTS.MANDATORY_CONTENT
    )
  }

}
