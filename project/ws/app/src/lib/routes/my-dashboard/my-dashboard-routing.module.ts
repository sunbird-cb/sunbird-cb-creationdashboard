import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MyDashboardHomeComponent } from './components/my-dashboard-home/my-dashboard-home.component'
import { PageResolve } from '@sunbird-cb/utils'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'my-dashboard',
  },

  {
    path: '',
    component: MyDashboardHomeComponent,
    data: {
      pageType: 'feature',
      pageKey: 'my-dashboard',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(
      routes),
  ],
  exports: [RouterModule],
})
export class MyDashboardRoutingModule { }
