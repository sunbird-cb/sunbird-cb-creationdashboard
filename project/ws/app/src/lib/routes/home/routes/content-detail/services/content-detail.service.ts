import { Injectable } from '@angular/core'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { NSApiResponse } from '../../../interface/apiResponse'
import { NSContent } from '../../../interface/content'
import { ISearchResult } from '../../../interface/search'
import { AccessControlService } from '../../../services/access-control.service'
import { ApiService } from '../../../services/api.service'
import { CONTENT_READ, EXPIRY_DATE_ACTION, SEARCH, SEARCH_V6_ADMIN, SEARCH_V6_AUTH } from '../../my-content/constants/apiEndpoints'
@Injectable()
export class MyContentService {
  constructor(
    private apiService: ApiService,
    private accessService: AccessControlService,
  ) { }

  fetchContent(searchData: any): Observable<any> {
    return this.apiService
      .post<NSApiResponse.ISearchApiResponse>(SEARCH, searchData)
      .pipe(map((data: NSApiResponse.IApiResponse<NSApiResponse.ISearchApiResponse>) => data))
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
  actionOnExpiry(meta: { expiryDate?: string; isExtend: boolean }, id: string): Observable<null> {
    const requestBody = {
      ...meta,
      identifier: id,
      org: this.accessService.org,
      rootOrg: this.accessService.rootOrg || '',
    }
    return this.apiService.post<null>(EXPIRY_DATE_ACTION, requestBody)
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
}
