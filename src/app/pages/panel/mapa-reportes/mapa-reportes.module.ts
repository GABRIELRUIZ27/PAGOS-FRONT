import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaReportesComponent } from './mapa-reportes.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MapaReportesRoutingModule } from './mapa-reportes-routing.component';

@NgModule({
  declarations: [
    MapaReportesComponent,
  ],
  imports: [
    CommonModule,
    MapaReportesRoutingModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class MapaReportesModule { }