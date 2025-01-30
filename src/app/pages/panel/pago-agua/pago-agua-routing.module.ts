import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagoAguaComponent } from './pago-agua.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PagoAguaComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessPagoAgua'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagoAguaRoutingModule { }
