import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/services/auth.guard';
import { DashboardReportesComponent } from './dashboard-reportes.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardReportesComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessDashboardReportes'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesAguaRoutingModule { }
