import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/services/auth.guard';
import { MapaReportesComponent } from './mapa-reportes.component';

const routes: Routes = [
  {
    path: '',
    component: MapaReportesComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessMapasReportes'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapaReportesRoutingModule { }