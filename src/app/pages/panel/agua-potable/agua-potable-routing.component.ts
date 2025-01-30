import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AguaPotableComponent } from './agua-potable.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AguaPotableComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessAgua'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AguaPotableRoutingModule { }
