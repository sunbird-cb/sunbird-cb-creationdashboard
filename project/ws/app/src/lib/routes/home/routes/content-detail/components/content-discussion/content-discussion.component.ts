import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsDiscussionForum } from '@sunbird-cb/collection'
import { NsWidgetResolver } from '@sunbird-cb/resolver'
import { ConfigurationsService, NsContent } from '@sunbird-cb/utils'
@Component({
  selector: 'ws-auth-content-discussion',
  templateUrl: './content-discussion.component.html',
  styleUrls: ['./content-discussion.component.scss'],
})
export class ContentDiscussionComponent implements OnChanges, OnInit {
  @Input() content!: NsContent.IContent
  showDiscussionForum = false
  isRestricted = true
  @Input() forPreview = false
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  constructor(private activatedRoute: ActivatedRoute, private configSvc: ConfigurationsService) { }

  ngOnChanges() {
    this.forPreview = false
    if (this.content) {
      this.discussionForumWidget = {
        widgetData: {
          description: this.content.description,
          id: this.content.identifier,
          name: NsDiscussionForum.EDiscussionType.LEARNING,
          title: this.content.name,
          initialPostCount: 2,
          isDisabled: this.forPreview,
        },
        widgetSubType: 'discussionForum',
        widgetType: 'discussionForum',
      }
    }
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        this.configSvc.restrictedFeatures.has('disscussionForum') ||
        this.configSvc.restrictedFeatures.has('disscussionForumTRPU')
    }
    if (this.activatedRoute.parent && this.activatedRoute.parent.data) {
      this.activatedRoute.parent.data.subscribe((data: any) => {
        if (data && data.content && data.content.data) {
          this.content = data.content.data
          this.ngOnChanges()
        }
      })
    }
  }
}
