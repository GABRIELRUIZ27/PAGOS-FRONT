import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/services/auth.guard';
import { ReportesAguaComponent } from './reportes-agua.component';

const routes: Routes = [
  {
    path: '',
    component: ReportesAguaComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessReportesAgua'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesAguaRoutingModule { }
