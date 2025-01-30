import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AguaService } from 'src/app/core/services/agua-potable.service';
import { ControlPagoService } from 'src/app/core/services/control-pago.service';
import { LoadingStates } from 'src/app/global/global';
import { Comunidad } from 'src/app/models/comunidad';
import { Agua } from 'src/app/models/agua';
import * as XLSX from 'xlsx';
import { ControlAgua } from 'src/app/models/control-agua';
import * as moment from 'moment';
import 'moment/locale/es';
moment.locale('es'); 
@Component({
  selector: 'app-control-agua',
  templateUrl: './control-agua.component.html',
  styleUrls: ['./control-agua.component.css']
})
export class ControlAguaComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  controlAgua!: ControlAgua;
  aguaForm!: FormGroup;
  controlA: ControlAgua[] = [];
  controlFilter: ControlAgua[] = [];
  isLoading = LoadingStates.neutro;
  agua: Agua[] = [];
  isModalAdd = true;
  comunidadForm!: FormGroup;
  controlSelect!: ControlAgua | undefined;
  sinAguaMessage = '';
  selectedDomicilio: string = '';
  selectedPeriodo: string = '';
  totalAgua: number = 0;
  totalAlcantarillado: number = 0;
  precioAgua: number = 65;
  precioAlcantarillado: number = 15;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private comunidadService: ComunidadService,
    private aguaService: AguaService,
    private controlPagoService: ControlPagoService,

  ) {
    this.controlPagoService.refreshListControlAgua.subscribe(() => this.getControlAgua());
    this.getAgua();
    this.getControlAgua();
    this.creteForm();
    this.isModalAdd = false;
  }

  getAgua() {
    this.aguaService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.agua = dataFromAPI) });
  }
  
  creteForm() {
    this.aguaForm = this.formBuilder.group({
      id: [null],
      fecha: ['',[Validators.required,],],
      importe: ['',[Validators.required,],],
      descripcion: ['',[Validators.required,],],
      agua: ['',[Validators.required,],],
      recargo: [''],    
      periodo: ['',[Validators.required,],],
      servicio: ['',[Validators.required,],],
      alcantarillado: ['',[Validators.required,],],
      inapam: [false],
      pagado: [false],
    });
  }

  getControlAgua() {
    this.isLoading = LoadingStates.trueLoading;
    this.controlPagoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.controlA = dataFromAPI;
        this.controlFilter = this.controlA;
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

    this.controlFilter = this.controlA.filter(
      (personal) =>
        personal.fecha.toLowerCase().includes(valueSearch) ||
        personal.importe.toLowerCase().includes(valueSearch) ||
        personal.agua.nombre.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  agregar() {
    this.controlAgua = this.aguaForm.value as ControlAgua;
    const agua = this.aguaForm.get('agua')?.value;

    this.controlAgua.agua = { id: agua } as Agua;

    this.spinnerService.show();
    this.controlPagoService.post(this.controlAgua).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Información de pago guardada correctamente');
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
    console.log('Cerrando el modal y reiniciando el formulario');
    this.closebutton.nativeElement.click();
    this.aguaForm.reset();
    this.selectedDomicilio = '';
    this.selectedPeriodo= '';
    this.totalAlcantarillado= 0;
    this.totalAgua= 0;
  }

  submit() {
    if (this.isModalAdd === false) {
    } else {
      this.agregar();
    }
  }

  exportarDatosAExcel() {
    if (this.controlA.length === 0) {
      console.warn('La lista de personal está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.controlA.map((personal) => {
      return {
        Fecha: personal.fecha,
        Importe: personal.importe,
        Descripcion: personal.descripcion,
        Usuario_Agua: personal.agua.nombre,
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

    this.guardarArchivoExcel(excelBuffer, 'control de agua potable.xlsx');
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

  creteForm2() {
    this.comunidadForm = this.formBuilder.group({
      comunidadId: [],
    });
  }

  onSelectPrograma(id: number | null) {
    this.controlSelect = this.controlA.find(
      (v) => v.agua.comunidad.id === id
    );

    if (this.controlSelect) {
      const valueSearch2 =
        this.controlSelect.agua.comunidad.nombre.toLowerCase();
      console.log('Search Value:', valueSearch2);

      // Filtrar los votantes
      this.controlFilter = this.controlA.filter((personal) =>
        personal.agua.comunidad.nombre
          .toLowerCase()
          .includes(valueSearch2)
      );
      this.sinAguaMessage = '';
      console.log('Filtered usuarios:', this.controlFilter);

      // Verificar si votantesFilter es null o vacío
      if (!this.controlFilter || this.controlFilter.length === 0) {
        this.controlFilter = [];
      }
      this.configPaginator.currentPage = 1;
    } else {
      this.sinAguaMessage = 'No se encontrarón registros en la comunidad.';
      // Si no se encuentra el votante seleccionado, establecer votantesFilter como un array vacío
      this.controlFilter = [];
    }
  }

  onClear() {
    if (this.controlA) {
      this.getAgua();
    }
    this.sinAguaMessage = '';
  }

  onSelectAgua(selectedUser: Agua | null) {
    console.log('Usuario seleccionado:', selectedUser); // Verificar el objeto seleccionado
  
    if (selectedUser) {
      // Llenar el campo de domicilio con el domicilio del usuario seleccionado
      this.selectedDomicilio = selectedUser.domicilio;
      this.selectedPeriodo = selectedUser.periodo ? selectedUser.periodo : 'No se tiene registro de último periodo de pago';
      console.log('Domicilio del usuario seleccionado:', this.selectedDomicilio); // Verificar el domicilio del usuario
    } else {
      // Limpiar el campo de domicilio si no hay un usuario seleccionado
      this.selectedDomicilio = '';
      this.selectedPeriodo = '';
      console.log('No se seleccionó ningún usuario, domicilio limpiado'); // Mensaje cuando no se selecciona nada
    }
  }
  
  onPeriodoChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const periodo = inputElement.value;
  
    console.log("Periodo ingresado:", periodo);
  
    // Dividir el periodo en dos fechas
    const fechas = periodo.split(' - ');
    if (fechas.length === 2) {
      const fechaInicio = moment(fechas[0], 'MMMM YYYY'); // Usar formato en español
      const fechaFin = moment(fechas[1], 'MMMM YYYY');
  
      console.log("Fecha inicio:", fechaInicio.isValid() ? fechaInicio.format('MMMM YYYY') : "Invalid date");
      console.log("Fecha fin:", fechaFin.isValid() ? fechaFin.format('MMMM YYYY') : "Invalid date");
  
      // Validar si las fechas son correctas
      if (fechaInicio.isValid() && fechaFin.isValid()) {
        const meses = fechaFin.diff(fechaInicio, 'months') + 1;
        console.log("Meses calculados:", meses);
  
        // Calculamos los totales
        this.totalAgua = this.precioAgua * meses;
        this.totalAlcantarillado = this.precioAlcantarillado * meses;
  
        console.log("Total Agua:", this.totalAgua);
        console.log("Total Alcantarillado:", this.totalAlcantarillado);
  
        // Actualizamos los campos de servicio y alcantarillado
        this.aguaForm.get('servicio')?.setValue(this.totalAgua.toFixed(2));
        this.aguaForm.get('alcantarillado')?.setValue(this.totalAlcantarillado.toFixed(2));
  
        // Sumar los totales y actualizar el campo "importe"
        const importeTotal = this.totalAgua + this.totalAlcantarillado;
        this.aguaForm.get('importe')?.setValue(importeTotal.toFixed(2)); // Actualizar el campo de importe como string
      } else {
        this.resetValores();
      }
    } else {
      this.resetValores();
    }
  }
  
  // Función auxiliar para resetear los valores
  resetValores() {
    this.totalAgua = 0;
    this.totalAlcantarillado = 0;
    this.aguaForm.get('servicio')?.setValue('0.00');
    this.aguaForm.get('alcantarillado')?.setValue('0.00');
    this.aguaForm.get('importe')?.setValue('0.00');
  }
  
  onInapamChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    console.log('INAPAM status:', checked);
  
    // Siempre partimos del importe base que ya fue calculado
    let importeTotal = this.totalAgua + this.totalAlcantarillado;
  
    // Si el switch de INAPAM está activo, aplicar el 50% de descuento al importe
    if (checked) {
      importeTotal *= 0.5; // Aplicar el descuento del 50%
    }
  
    // Asegurarse de que el importe se actualice como un string
    const importeString = importeTotal.toFixed(2);
  
    // Actualizar el campo de "importe" con el valor calculado como string
    this.aguaForm.get('importe')?.setValue(importeString);
    
    // No modificar los valores de servicio y alcantarillado; solo recalcular el importe
  }
  
}
