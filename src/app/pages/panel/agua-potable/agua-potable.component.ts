import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AguaService } from 'src/app/core/services/agua-potable.service';
import { TipoServicioService } from 'src/app/core/services/tipo-servicios.service';
import { LoadingStates } from 'src/app/global/global';
import { Comunidad } from 'src/app/models/comunidad';
import { Agua } from 'src/app/models/agua';
import * as XLSX from 'xlsx';
import {TiposDeServicio} from 'src/app/models/tiposDeServicio';
import * as moment from 'moment';

@Component({
  selector: 'app-agua-potable',
  templateUrl: './agua-potable.component.html',
  styleUrls: ['./agua-potable.component.css']
})
export class AguaPotableComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  agua!: Agua;
  aguaForm!: FormGroup;
  aguaP: Agua[] = [];
  aguaFilter: Agua[] = [];
  isLoading = LoadingStates.neutro;
  comunidad: Comunidad[] = [];
  isModalAdd = true;
  comunidadForm!: FormGroup;
  aguaSelect!: Agua | undefined;
  sinAguaMessage = '';
  servicioForm!: FormGroup;
  servicioSelect!: TiposDeServicio | undefined;
  sinServicioMessage = '';
  tiposDeServicio: TiposDeServicio[] = [];
  
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private comunidadService: ComunidadService,
    private aguaService: AguaService,
    private tipoServicioService: TipoServicioService,

  ) {
    this.aguaService.refreshListAgua.subscribe(() => this.getAgua());
    this.getAgua();
    this.getComunidad();
    this.getTipo();
    this.creteForm();
    this.isModalAdd = false;
    this.creteForm2();
    this.creteForm3();
  }

  getComunidad() {
    this.comunidadService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.comunidad = dataFromAPI) });
  }

  getTipo() {
    this.tipoServicioService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.tiposDeServicio = dataFromAPI) });
  }

  creteForm() {
    this.aguaForm = this.formBuilder.group({
      id: [null],
      domicilio: ['',[Validators.required,],],
      folio: [''],
      contrato: ['',[Validators.required,],],
      comunidad: ['',[Validators.required,],],
      periodo: [''],
      nombre: ['',[Validators.required,],],
      tipoServicio: ['',[Validators.required,],],
    });
  }

  getAgua() {
    this.isLoading = LoadingStates.trueLoading;
    this.aguaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.aguaP = dataFromAPI;
        this.aguaFilter = this.aguaP;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.aguaFilter = this.aguaP.filter(
      (personal) =>
        personal.nombre.toLowerCase().includes(valueSearch) ||
        personal.contrato.toLowerCase().includes(valueSearch) ||
        personal.comunidad.nombre.toLowerCase().includes(valueSearch)||
        personal.tipoServicio.nombre.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  idUpdate!: number;

  setDataModalUpdate(dto: Agua) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.aguaForm.patchValue({
      id: dto.id,
      domicilio: dto.domicilio,
      folio: dto.folio,
      nombre: dto.nombre,
      contrato: dto.contrato,
      periodo: dto.periodo,
      comunidad: dto.comunidad.id,
      servicio: dto.tipoServicio.id,
      tipoServicio: dto.tipoServicio.id,
    });
  }

  editarPersonal() {
    this.agua = this.aguaForm.value as Agua;

    const comunidad = this.aguaForm.get('comunidad')?.value;
    const tipoServicio = this.aguaForm.get('tipoServicio')?.value;

    this.agua.comunidad = { id: comunidad } as Comunidad;
    this.agua.tipoServicio = { id: tipoServicio } as TiposDeServicio;

    this.spinnerService.show();
    this.aguaService.put(this.idUpdate, this.agua).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Usuario de agua potable actualizado correctamente');
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar a: ${nameItem}?`,
      () => {
        this.aguaService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Usuario de agua potable borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  agregar() {
    this.agua = this.aguaForm.value as Agua;
    const comunidad = this.aguaForm.get('comunidad')?.value;
    const tipoServicio = this.aguaForm.get('tipoServicio')?.value;

    this.agua.comunidad = { id: comunidad } as Comunidad;
    this.agua.tipoServicio = { id: tipoServicio } as TiposDeServicio;

    this.spinnerService.show();
    this.aguaService.post(this.agua).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Usuario de agua potable guardado correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.aguaForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarPersonal();
    } else {
      this.agregar();
    }
  }

  exportarDatosAExcel() {
    if (this.aguaP.length === 0) {
      console.warn('La lista de personal está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.aguaP.map((personal) => {
      return {
        Nombre: personal.nombre,
        Domicilio: personal.domicilio,
        Folio: personal.folio,
        Contrato: personal.contrato,
        Comunidad: personal.comunidad.nombre,
        Periodo: personal.periodo,
        Servicio: personal.tipoServicio.id,
      };
    });

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarArchivoExcel(excelBuffer, 'concentrado de agua potable.xlsx');
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleChangeAdd() {
    if (this.aguaForm) {
      this.aguaForm.reset();
      this.isModalAdd = true;
    }
  }

 // Inicializar los formularios correctamente
creteForm2() {
  this.comunidadForm = this.formBuilder.group({
    comunidadId: [null], // Asegúrate de inicializar con null
  });
}

creteForm3() {
  this.servicioForm = this.formBuilder.group({
    tipoId: [null], // Asegúrate de inicializar con null
  });
}

// Método unificado para aplicar los filtros
onFilterChange() {
  const comunidadId = this.comunidadForm.get('comunidadId')?.value;
  const tipoId = this.servicioForm.get('tipoId')?.value;

  this.aguaFilter = this.aguaP;

  if (comunidadId) {
    this.aguaFilter = this.aguaFilter.filter(personal =>
      personal.comunidad.id === comunidadId
    );
  }

  if (tipoId) {
    this.aguaFilter = this.aguaFilter.filter(personal =>
      personal.tipoServicio.id === tipoId
    );
  }

  // Verifica si hay resultados
  if (this.aguaFilter.length === 0) {
    this.sinAguaMessage = 'No se encontraron registros con los filtros aplicados.';
  } else {
    this.sinAguaMessage = '';
  }

  this.configPaginator.currentPage = 1;
}

// Método para limpiar los filtros
onClear() {
  this.comunidadForm.reset();
  this.servicioForm.reset();
  this.getAgua(); 
  this.sinAguaMessage = '';
}

isAlCorriente(periodo: string | null): boolean {
  if (!periodo) {
    return false; 
  }

  // Dividir el periodo en partes separadas por el guion "-"
  const partesPeriodo = periodo.split('-');

  // Tomar la segunda parte y quitar espacios adicionales
  const fechaFinal = partesPeriodo[1] ? partesPeriodo[1].trim() : null;

  if (!fechaFinal) {
    return false; 
  }

  // Convertir la fecha final a un objeto Moment
  const mesPeriodoFinal = moment(fechaFinal, 'MMMM YYYY'); 
  const mesActual = moment(); // Fecha actual

  // Regresar true si el mes del periodo final es igual o posterior al mes actual
  return mesPeriodoFinal.isSameOrAfter(mesActual, 'month');
}

}
