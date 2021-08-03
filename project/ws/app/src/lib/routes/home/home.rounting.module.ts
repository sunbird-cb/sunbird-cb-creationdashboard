import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
// import { InitResolver } from './resol./routes/profile-v2/discuss-all.component'
import { HomeResolve } from './resolvers/home-resolve'
import { AboutComponent } from './routes/about/about.component'
import { HomeComponent } from './routes/home/home.component'
import { UsersViewComponent } from './routes/users-view/users-view.component'
import { RolesAccessComponent } from './routes/roles-access/roles-access.component'
// import { CreateMdoComponent } from './routes/create-mdo/create-mdo.component'
// import { CreateUserComponent } from './routes/create-user/create-user.component'
import { DepartmentResolve } from './resolvers/department-resolve'
import { InitResolver } from './resolvers/init-resolve.service'
import { DepartmentResolver } from './routes/my-content/resolvers/department-resolv.servive'
import { AllContentComponent } from './routes/my-content/components/all-content/all-content.component'
import { ComingSoonComponent } from './routes/coming-soon/coming-soon.component'
import { WelcomeComponent } from './routes/welcome/welcome.component'
import { UserRoleResolve } from './resolvers/userrole-resolve'
import { ConfigResolveService } from './resolvers/config-resolve.service'
import { DirectoryViewComponent } from './routes/directory/directroy.component'
// import { PageResolve } from '@sunbird-cb/utils'
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'welcome',
  },
  {
    path: '',
    component: HomeComponent,
    resolve: {
      // department: DepartmentResolve,
      // userRoles: UserRoleResolve,
      configService: ConfigResolveService,
    },
    children: [
      {
        path: 'welcome',
        component: WelcomeComponent,
      },
      {
        path: 'users',
        component: UsersViewComponent,
        children: [],
      },
      {
        path: 'competency',
        component: ComingSoonComponent,
      },
      {
        path: 'budgeting',
        component: ComingSoonComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'roles-access',
        component: RolesAccessComponent,
      },
      {
        path: 'directory',
        component: DirectoryViewComponent,
      },
      {
        path: 'approvals',
        component: ComingSoonComponent,
      },
      // {
      //   path: ':department/create-department',
      //   component: CreateMdoComponent,
      // },
      // {
      //   path: 'create-user',
      //   component: CreateUserComponent,
      // },
      {
        path: 'cbp',
        component: AllContentComponent,
        data: { load: ['ordinals', 'ckeditor', 'meta'] },
        resolve: {
          script: InitResolver,
          // departmentData: DepartmentResolver, // comment for sunbird BE to work should be removed
        },
      },
    ],
  },
  {
    path: 'content-detail',
    loadChildren: () =>
      import('./routes/content-detail/content-detail.module').then(u => u.ContentDetailModule),
    data: { load: ['ordinals', 'ckeditor', 'meta'] },
    resolve: {
      script: InitResolver,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    HomeResolve,
    DepartmentResolve,
    InitResolver,
    DepartmentResolver,
    UserRoleResolve,
    ConfigResolveService,
  ],
})
export class HomeRoutingModule { }
