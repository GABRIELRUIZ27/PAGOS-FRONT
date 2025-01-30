import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlAguaComponent } from './control-agua.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ControlAguaComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessControlAgua'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlAguaRoutingModule { }
