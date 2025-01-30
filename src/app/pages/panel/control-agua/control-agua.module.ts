import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlAguaComponent } from './control-agua.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ControlAguaRoutingModule } from './control-agua-routing.component';


@NgModule({
  declarations: [
    ControlAguaComponent
  ],
  imports: [
    CommonModule,
    ControlAguaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class  ControlAguaModule { }
