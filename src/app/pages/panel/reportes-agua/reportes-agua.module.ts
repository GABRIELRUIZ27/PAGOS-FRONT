import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReportesAguaComponent } from './reportes-agua.component';
import { ReportesAguaRoutingModule } from './reportes-agua-routing.module';


@NgModule({
  declarations: [
    ReportesAguaComponent
  ],
  imports: [
    CommonModule,
    ReportesAguaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class  ReportesAguaModule { }
