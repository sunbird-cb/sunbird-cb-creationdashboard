import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

const PROTECTED_SLAG_V8 = '/apis/protected/v8'

const API_END_POINTS = {
  DISCUSS_PROFILE: '/apis/protected/v8/discussionHub/users',
  PROFILE_DETAIL: `${PROTECTED_SLAG_V8}/social/post/timeline`,
  SOCIAL_VIEW_CONVERSATION: `${PROTECTED_SLAG_V8}/social/post/viewConversation`,
  GET_MY_DEPARTMENT: '/apis/protected/v8/portal/cbc/mydepartment?allUsers=true',
  GET_USER_DETAILS: `/apis/protected/v8/user/details?ts='${Date.now()}`,
  GET_USER_DETAILS_PROFILE: '/apis/proxies/v8/api/user/v2/read'
}

@Injectable({
  providedIn: 'root',
})
export class ProfileV2Service {
  constructor(private http: HttpClient) { }
  fetchDiscussProfile(wid: string): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.DISCUSS_PROFILE}/${wid}`)
  }

  fetchPost(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.SOCIAL_VIEW_CONVERSATION, request)
  }
  getMyDepartment(): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.GET_MY_DEPARTMENT}`)
    // return EMPTY
  }
  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.GET_USER_DETAILS}`)
  }
  fetchProfile(id: string): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.GET_USER_DETAILS_PROFILE}/${id}`).pipe(map((res: any) => res && res.result && res.result.response))
  }
}
