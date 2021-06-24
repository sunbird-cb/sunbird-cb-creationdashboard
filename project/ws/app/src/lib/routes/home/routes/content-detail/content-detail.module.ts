import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  AtGlanceModule,
  CardTableModule,
  LeftMenuModule,
  PipeContentRouteModule,
  UserContentDetailedRatingModule,
  UserContentRatingModule,
  AuthorCardModule,
} from '@sunbird-cb/collection'
import { ContentDetailComponent } from './components/content-detail/content-detail.component'
import { MyContentRoutingModule } from './content-detail-routing.module'
import { MyContentService } from './services/content-detail.service'
import { MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatSidenavModule, MatSortModule, MatTableModule } from '@angular/material'
import { PipeDurationTransformModule } from '@sunbird-cb/utils'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import { ContentDetailHomeComponent } from './components/content-detail-home/content-detail-home.component'
import { ContentInsightsComponent } from './components/content-Insights/content-Insights.component'
import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
import { AppTocService } from './services/app-toc.service'
import { MyTocService } from './services/my-toc.service'
import { ContentDiscussionComponent } from './components/content-discussion/content-discussion.component'
import { LocalDataService } from './services/local-data.service'

@NgModule({
  declarations: [ContentDetailHomeComponent, ContentDetailComponent, ContentInsightsComponent, ContentDiscussionComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MyContentRoutingModule,
    PipeContentRouteModule,
    PipeDurationTransformModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatProgressBarModule,
    CardTableModule,
    LeftMenuModule,
    WidgetResolverModule,
    AtGlanceModule,
    AuthorCardModule,
    UserContentRatingModule,
    UserContentDetailedRatingModule,
  ],
  providers: [
    AppTocService,
    MyContentService,
    AppTocResolverService,
    MyTocService,
    LocalDataService,

  ],
  entryComponents: [],
})
export class ContentDetailModule { }
