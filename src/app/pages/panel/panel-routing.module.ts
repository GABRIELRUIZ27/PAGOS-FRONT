import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel.component';

const routes: Routes = [
  {
    path: '',
    component: PanelComponent,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadChildren: () =>
          import('./inicio/inicio.module').then((i) => i.InicioModule),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./usuarios/usuarios.module').then((i) => i.UsuariosModule),
      },
      {
        path: 'agua-potable',
        loadChildren: () =>
          import('./agua-potable/agua-potable.module').then((i) => i.AguaPotableModule),
      },
      {
        path: 'control-agua',
        loadChildren: () =>
          import('./control-agua/control-agua.module').then((i) => i.ControlAguaModule),
      },
      {
        path: 'pago-agua',
        loadChildren: () =>
          import('./pago-agua/pago-agua.module').then((i) => i.PagoAguaModule),
      },
      {
        path: 'reportes-agua',
        loadChildren: () =>
          import('./reportes-agua/reportes-agua.module').then((i) => i.ReportesAguaModule),
      },
      {
        path: 'mapa-reportes',
        loadChildren: () =>
          import('./mapa-reportes/mapa-reportes.module').then((i) => i.MapaReportesModule),
      },
      {
        path: 'dashboard-reportes',
        loadChildren: () =>
          import('./dashboard-reportes/dashboard-reportes.module').then((i) => i.DashboardReportesModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelRoutingModule {}
