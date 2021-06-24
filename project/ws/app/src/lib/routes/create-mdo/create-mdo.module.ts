import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CreateMDORoutingModule } from './create-mdo-routing.module'
import { HomeComponent } from './routes/home/home.component'
import {
  BtnPageBackModuleAdmin,
  LeftMenuModule, GroupCheckboxModule,
  UIAdminTableModule, ScrollspyLeftMenuModule,
} from '@sunbird-cb/collection'
import { HomeModule } from '../home/home.module'
import { RouterModule } from '@angular/router'
import { UsersComponent } from './routes/users/users.component'
import { UsersService } from './services/users.service'
import {
  MatSidenavModule,
  MatIconModule,
} from '@angular/material'
import { MatCardModule } from '@angular/material/card'
import { RolesAccessComponent } from '../access/routes/roles-access/roles-access.component'
import { WidgetResolverModule } from '@sunbird-cb/resolver'

@NgModule({
  declarations: [HomeComponent, UsersComponent, RolesAccessComponent],
  imports: [CommonModule, CreateMDORoutingModule, BtnPageBackModuleAdmin, LeftMenuModule, WidgetResolverModule,
    MatSidenavModule, MatIconModule, GroupCheckboxModule, HomeModule, RouterModule, UIAdminTableModule, MatCardModule, ScrollspyLeftMenuModule],
  exports: [UsersComponent, RolesAccessComponent],
  providers: [UsersService],
})
export class CreateMDOModule { }
