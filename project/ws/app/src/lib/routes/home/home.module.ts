import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  PipeFilterModule,
  PipeHtmlTagRemovalModule,
  PipeOrderByModule,
  PipeRelativeTimeModule,
  ImageCropModule,
  PipeDurationTransformModule,
} from '@sunbird-cb/utils'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDividerModule } from '@angular/material/divider'
import { WidgetResolverModule } from '@sunbird-cb/resolver'
import {
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatDialogModule,
  MatSelectModule,
  MatInputModule,
  MatButtonModule,
  MatSidenavModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatCheckboxModule,
  MatMenuModule,
  MatSortModule,
  MatTableModule,
  MatTreeModule,
} from '@angular/material'
import { MatCardModule } from '@angular/material/card'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { InitResolver } from './resolvers/init-resolve.service'
import { RouterModule } from '@angular/router'
import { HomeRoutingModule } from './home.rounting.module'
import { HomeComponent } from './routes/home/home.component'
import { UsersViewComponent } from './routes/users-view/users-view.component'
import { AvatarPhotoModule, BtnPageBackModule, LeftMenuModule, UserAutocompleteModule, BreadcrumbsOrgModule, AtGlanceModule, CardTableModule, PipeContentRouteModule, BtnFullscreenModule } from '@sunbird-cb/collection'
import { AboutComponent } from './routes/about/about.component'
import { RolesAccessComponent } from './routes/roles-access/roles-access.component'
import { DirectoryViewComponent } from './routes/directory/directroy.component'
import { CreateMdoComponent } from './routes/create-mdo/create-mdo.component'
import { UsersComponent } from './routes/users/users.component'
import { OpenRolesDialogComponent } from './routes/users/components/open-roles-dialog/open-roles-dialog.component'
import { EditDepartmentDialogComponent } from './routes/users/components/edit-department-dialog/edit-department-dialog.component'
import { CreateUserComponent } from './routes/create-user/create-user.component'
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown'
import { ApiService } from './services/api.service'
import { AccessControlService } from './services/access-control.service'
import { LoaderService } from './services/loader.service'
import { AuthInitService } from './services/init.service'
import { AllContentComponent } from './routes/my-content/components/all-content/all-content.component'
import { MyContentService } from './routes/my-content/services/my-content.service'
import { UserPopupComponent } from './routes/user-popup/user-popup'
import { ComingSoonComponent } from './routes/coming-soon/coming-soon.component'
import { WelcomeComponent } from './routes/welcome/welcome.component'
import { CountModule } from './routes/welcome/count-component/count.module'
import { RainDashboardsModule } from '@sunbird-cb/rain-dashboards'
import { UIAdminTableModule } from '../../head/ui-admin-table/ui-admin-table.module'

@NgModule({
  declarations: [
    HomeComponent,
    UsersViewComponent,
    AboutComponent,
    RolesAccessComponent,
    DirectoryViewComponent,
    AllContentComponent,
    CreateMdoComponent,
    UsersComponent,
    OpenRolesDialogComponent,
    EditDepartmentDialogComponent,
    CreateUserComponent,
    UserPopupComponent,
    ComingSoonComponent,
    WelcomeComponent,
  ],
  imports: [
    CommonModule,
    UIAdminTableModule,
    CountModule,
    WidgetResolverModule,
    BtnFullscreenModule,
    ReactiveFormsModule,
    HomeRoutingModule,
    LeftMenuModule,
    FormsModule,
    RouterModule,
    MatGridListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatListModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    PipeFilterModule,
    PipeHtmlTagRemovalModule,
    PipeRelativeTimeModule,
    AvatarPhotoModule,
    BreadcrumbsOrgModule,
    PipeOrderByModule,
    BtnPageBackModule,
    WidgetResolverModule,
    UserAutocompleteModule,
    ImageCropModule,
    CommonModule,
    PipeContentRouteModule,
    PipeDurationTransformModule,
    MatTableModule,
    MatSortModule,
    CardTableModule,
    WidgetResolverModule,
    MatSidenavModule,
    MatIconModule,
    MatTreeModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    FormsModule,
    AtGlanceModule,
    RainDashboardsModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  entryComponents: [OpenRolesDialogComponent, EditDepartmentDialogComponent],
  providers: [
    // CKEditorService,
    // LoaderService,
    InitResolver,
    ApiService,
    AccessControlService,
    LoaderService,
    AuthInitService,
    MyContentService,
  ],
})
export class HomeModule {

}
