import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReportesAguaRoutingModule } from './dashboard-reportes-routing.component';
import { DashboardReportesComponent } from './dashboard-reportes.component';
import { HighchartsChartModule } from 'highcharts-angular';


@NgModule({
  declarations: [
    DashboardReportesComponent
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
    HighchartsChartModule,
  ]
})
export class  DashboardReportesModule { }
