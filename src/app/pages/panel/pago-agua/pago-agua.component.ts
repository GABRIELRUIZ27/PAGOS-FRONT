import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AguaService } from 'src/app/core/services/agua-potable.service';
import { ControlPagoService } from 'src/app/core/services/control-pago.service';
import { LoadingStates } from 'src/app/global/global';
import { Agua } from 'src/app/models/agua';
import * as XLSX from 'xlsx';
import { ControlAgua } from 'src/app/models/control-agua';
import * as moment from 'moment';
import 'moment/locale/es';
moment.locale('es'); 
import { HttpClient } from '@angular/common/http';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-pago-agua',
  templateUrl: './pago-agua.component.html',
  styleUrls: ['./pago-agua.component.css']
})
export class PagoAguaComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  controlAgua!: ControlAgua;
  aguaForm!: FormGroup;
  control!: ControlAgua;
  controlA: ControlAgua[] = [];
  controlFilter: ControlAgua[] = [];
  isLoading = LoadingStates.neutro;
  agua: Agua[] = [];
  isModalAdd = true;
  comunidadForm!: FormGroup;
  controlSelect!: ControlAgua | undefined;
  sinAguaMessage = '';
  selectedDomicilio: string = '';
  totalAgua: number = 0;
  totalAlcantarillado: number = 0;
  precioAgua: number = 65;
  precioAlcantarillado: number = 15;
  selectedRecibo: ControlAgua | null = null;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private comunidadService: ComunidadService,
    private aguaService: AguaService,
    private controlPagoService: ControlPagoService,
    private http: HttpClient

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
      periodo: ['',[Validators.required,],],
      servicio: ['',[Validators.required,],],
      alcantarillado: ['',[Validators.required,],],
      inapam: [false],
      pago: [false],
    });
  }

  setDataModalUpdate(dto: ControlAgua) {
    this.isModalAdd = false;
    this.id = dto.id;

    // Buscar el apoyo en base al id
    const apoyo = this.controlFilter.find((p) => p.id === dto.id);

    // Actualizar el formulario
    this.aguaForm.patchValue({
      id: dto.id,
      agua: dto.agua.id,
      fecha: dto.fecha,
      importe: dto.importe,  // Asegúrate de que el programa está en los programas filtrados
      descripcion: dto.descripcion,
      servicio: dto.servicio,
      alcantarillado: dto.alcantarillado,
      periodo: dto.periodo,
      inapam: dto.inapam,
    });

    console.log('setDataUpdateForm ', this.aguaForm.value);
    console.log('setDataUpdateDTO', dto);
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
      console.log('Domicilio del usuario seleccionado:', this.selectedDomicilio); // Verificar el domicilio del usuario
    } else {
      // Limpiar el campo de domicilio si no hay un usuario seleccionado
      this.selectedDomicilio = '';
      console.log('No se seleccionó ningún usuario, domicilio limpiado'); // Mensaje cuando no se selecciona nada
    }
  }
  
  idUpdate!: number;
  id!: number;

  pagar(idUpdate: number, dto: ControlAgua) {
    this.id = idUpdate; 
  
    // Genera un folio único con prefijo y una parte aleatoria
    const folio = this.generarFolio();
  
    this.control = {
      ...this.aguaForm.value as ControlAgua,
      pago: true,
      folio: folio,  // Asigna el folio generado aquí
      agua: { id: this.aguaForm.get('agua')?.value } as Agua, 
    };
  
    this.spinnerService.show();
    this.controlPagoService.put(this.id, this.control).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(`Pago guardado correctamente.`);
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }
  
  // Método para generar el folio
  generarFolio(): string {
    const prefijo = 'APE24';
    const randomPart = Math.floor(100000 + Math.random() * 900000).toString(); // Parte aleatoria de 6 dígitos
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp para unicidad
    return `${prefijo}${randomPart}${timestamp}`;
  }
  

  abrirModalReciboPago(recibo: ControlAgua) {
    this.selectedRecibo = recibo; // Almacena el recibo seleccionado
    console.log("Recibo seleccionado:", this.selectedRecibo);
  
    const fechaElement = document.getElementById("fecha");
    const nombreResponsableElement = document.getElementById("nombreResponsable");
    const totalElement = document.getElementById("total");
    const inapamElement = document.getElementById("inapam");
    const direccionElement = document.getElementById("direccion");
    const asuntoElement = document.getElementById("asunto");
    const contratoElement = document.getElementById("contrato");
    const comunidadElement = document.getElementById("comunidad");
    const folioElement = document.getElementById("folio");
    const periodoElement = document.getElementById("periodo");

    console.log("Elementos del DOM:", { fechaElement, nombreResponsableElement, totalElement, inapamElement });
  
    if (periodoElement && fechaElement && nombreResponsableElement && totalElement && inapamElement && direccionElement && asuntoElement && contratoElement && comunidadElement && folioElement) {
      periodoElement.innerText = this.selectedRecibo?.periodo ?? '';
      fechaElement.innerText = this.selectedRecibo?.fecha ?? '';
      folioElement.innerText = this.selectedRecibo?.folio ?? '';
      nombreResponsableElement.innerText = this.selectedRecibo?.agua?.nombre ?? '';
      direccionElement.innerText = this.selectedRecibo?.agua?.domicilio ?? '';
      contratoElement.innerText = this.selectedRecibo?.agua?.contrato ?? '';
      comunidadElement.innerText = this.selectedRecibo?.agua?.comunidad?.nombre ?? '';
      asuntoElement.innerText = this.selectedRecibo?.descripcion ?? '';
      totalElement.innerText = `$${parseFloat(this.selectedRecibo?.importe || '0').toFixed(2)}`;
      inapamElement.innerText = this.selectedRecibo?.inapam ? 'Descuento INAPAM aplicado' : 'Sin descuento INAPAM';
  
      // Muestra el modal
      const modalElement = document.getElementById("modalReciboPago");
      if (modalElement) {
        modalElement.style.display = "block";
      }
    } else {
      console.error("Error: No se encontraron los elementos del DOM");
    }
  }
  

  // Método para cerrar el modal
  cerrarModal() {
    const modalElement = document.getElementById("modalReciboPago");
    if (modalElement) {
      modalElement.style.display = "none";
    }
  }

  imprimirRecibo() {
    // Selecciona solo el contenido de `modal-body` que queremos capturar
    const modalBodyElement = document.querySelector('.modal-body') as HTMLElement;
  
    if (modalBodyElement) {
      // Usa html2canvas para convertir el contenido del `modal-body` en una imagen
      html2canvas(modalBodyElement, { scale: 2 }).then(canvas => {
        // Crear una ventana para impresión
        const printWindow = window.open('', '_blank');
  
        if (printWindow) {
          // Convertir el canvas a dataURL y generar una imagen
          const imgData = canvas.toDataURL('image/png');
  
          // Construye el HTML para la impresión con la imagen generada
          printWindow.document.write(`
            <html>
              <head>
                <title>Imprimir Recibo</title>
                <style>
                  body, html {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                  }
                </style>
              </head>
              <body>
                <img src="${imgData}" alt="Recibo de Pago"/>
              </body>
            </html>
          `);
  
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          };
        } else {
          console.error("No se pudo abrir la ventana de impresión");
        }
      }).catch(error => {
        console.error("Error al generar la imagen del modal:", error);
      });
    } else {
      console.error("No se encontró el contenido del modal para capturar");
    }
  }
  
}

