
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { RolesAccessComponent } from '../home/routes/roles-access/roles-access.component'
import { HomeComponent } from './routes/home/home.component'
import { UsersComponent } from './routes/users/users.component'

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: ':department/users',
        component: UsersComponent,
      },
      {
        path: ':department/roles-access',
        component: RolesAccessComponent,
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateMDORoutingModule { }
