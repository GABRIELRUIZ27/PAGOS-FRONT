import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagoAguaRoutingModule } from './pago-agua-routing.module';
import { PagoAguaComponent } from './pago-agua.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    PagoAguaComponent
  ],
  imports: [
    CommonModule,
    PagoAguaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class  PagoAguaModule { }
