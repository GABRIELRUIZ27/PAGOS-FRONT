import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { ReporteAguaService } from 'src/app/core/services/reporte-fugas.service';
import { LoadingStates } from 'src/app/global/global';
import { Reporte } from 'src/app/models/reportes';
import * as XLSX from 'xlsx';
import { Comunidad } from 'src/app/models/comunidad';

@Component({
  selector: 'app-reportes-agua',
  templateUrl: './reportes-agua.component.html',
  styleUrls: ['./reportes-agua.component.css']
})
export class ReportesAguaComponent {
  @ViewChild('mapCanvasUbicacion') mapCanvasUbicacion!: ElementRef<HTMLElement>;
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLElement>;
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('ubicacionInput', { static: false }) ubicacionInput!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  reporteForm!: FormGroup;
  isModalAdd = true;
  latitude: number = 19.316818295403003;
  longitude: number = -98.23837658175323;
  canvas!: HTMLElement;
  private map: any;
  private marker: any;
  maps!: google.maps.Map;
  comunidades: Comunidad[] = [];
  Reportes: Reporte[] = [];
  imagenAmpliada: string | null = null;
  isLoading = LoadingStates.neutro;
  id!: number;
  public isUpdatingfoto: boolean = false;
  reportes!: Reporte;
  public isUpdatingImg: boolean = false;
  public imgPreview: string = '';
  reporteFilter: Reporte[] = [];
  comunidadForm!: FormGroup;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private comunidadService: ComunidadService,
    private reportesService: ReporteAguaService
  ) {
    this.reportesService.refreshListReporteAgua.subscribe(() => this.getReportes());
    this.getComunidad();
    this.createForm();
    this.getReportes();
  }
  
  getReportes() {
    this.isLoading = LoadingStates.trueLoading;
    this.reportesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.Reportes = dataFromAPI;
        this.reporteFilter = this.Reportes;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  createForm() {
    const fechaActual = new Date();
    const fechaFormateada = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${fechaActual.getDate().toString().padStart(2, '0')}`;
  
    this.reporteForm = this.formBuilder.group({
      id: [null],
      nombre: [''],
      foto: [''],
      telefono: [''],
      direccion: ['', [Validators.required]],
      imagenBase64: [''],
      latitud: [],
      longitud: [],
      comunidad: ['', Validators.required],
      fecha: [fechaFormateada], // Solo la fecha 'YYYY-MM-DD'
      atendida: [false], // Se establece en falso por defecto
    });
  }

  marcarAtendido(agua: any) {
    const updateData = { atendida: true };
  
    this.reportesService.updateAtendida(agua.id, updateData).subscribe({
      next: () => {
        this.mensajeService.mensajeExito('Estado actualizado a "Atendido"');
  
        this.getReportes();
      },
      error: (error) => {
        this.mensajeService.mensajeError('Error al actualizar el estado: ' + error.message);
      }
    });
  }
  
  
  getComunidad() {
    this.comunidadService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.comunidades = dataFromAPI) });
  }

  agregar() {
    if (this.reporteForm.invalid) {
      this.mensajeService.mensajeError('Por favor, completa los campos obligatorios.');
      return;
    }
  
    this.reportes = this.reporteForm.value as Reporte;
  
    // Asegurar que la comunidad seleccionada se asigne correctamente
    const comunidadId = this.reporteForm.get('comunidad')?.value;
    this.reportes.comunidad = { id: comunidadId } as Comunidad;
  
    this.spinnerService.show();
  
    const imagenBase64 = this.reporteForm.get('imagenBase64')?.value;
  
    // 🔹 **Asegurar que `fecha` y `atendida` estén en el objeto**
    let formData = {
      ...this.reportes,
      foto: "imagen_reporte.jpg",
      imagenBase64: imagenBase64 || null, // Si no hay imagen, enviar `null`
      fecha: this.reporteForm.get('fecha')?.value || new Date().toISOString().split('T')[0], // Si por algún motivo se pierde la fecha, la generamos de nuevo
      atendida: this.reporteForm.get('atendida')?.value ?? false, // Asegurar que `false` se envíe correctamente
    };
  
    console.log('Datos enviados:', formData);
  
    // Llamar al servicio para enviar el reporte
    this.reportesService.post(formData).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Reporte enviado correctamente');
  
        // Resetear el formulario y cerrar el modal
        this.resetForm();
        document.getElementById('closebutton')?.click();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError('Error al enviar el reporte: ' + error.message);
      },
    });
  }
  
  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.isUpdatingImg = false;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.reporteForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };
      this.isUpdatingfoto = false;
      reader.readAsDataURL(file);
    }
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.reporteForm.reset();
  }

  resetMap() {
    this.ubicacionInput.nativeElement.value = '';
    this.setCurrentLocation();
    this.ngAfterViewInit();
  }

  handleChangeAdd() {
    if (this.reporteForm) {
      this.reporteForm.reset();
      this.isModalAdd = true;
      this.isUpdatingfoto = false;
      this.isUpdatingImg = false;
    }
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.reporteFilter = this.reporteFilter.filter(
      (personal) =>
        personal.comunidad.nombre.toLowerCase().includes(valueSearch) ||
        personal.direccion.toLowerCase().includes(valueSearch) ||
        personal.telefono?.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

    exportarDatosAExcel() {
      if (this.Reportes.length === 0) {
        console.warn('La lista de personal está vacía. No se puede exportar.');
        return;
      }
  
      const datosParaExportar = this.Reportes.map((personal) => {
        return {
          Comunidad: personal.comunidad.nombre,
          Nombre: personal.nombre,
          Telefono: personal?.telefono,
          Direccion: personal.direccion,
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

  cerrarModal() {
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      });
    }
  }

  getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        const geocoder = new google.maps.Geocoder();
        const latLng = new google.maps.LatLng(this.latitude, this.longitude);
        this.adress();
      });
    }
  }
  adress() {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(this.latitude, this.longitude);

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK') {
        if (results && results[0]) {
          const place = results[0];
          const formattedAddress = place.formatted_address || '';

          if (formattedAddress.toLowerCase().includes('tlax')) {
            if (place.formatted_address) {
              this.reporteForm.patchValue({
                direccion: place.formatted_address,
                domicilio: place.formatted_address,
              });
            } else {
              console.log('No se pudo obtener la dirección.');
            }
            this.selectAddress(place);
          } else {
            window.alert('Por favor, selecciona una dirección en Tlaxcala.');
          }
        } else {
          console.error('No se encontraron resultados de geocodificación.');
        }
      } else {
        console.error(
          'Error en la solicitud de geocodificación inversa:',
          status
        );
      }
    });
  }

  selectAddress(event: any) {
    if (!event || !event.formatted_address) {
      console.error('Evento inválido o sin dirección formateada:', event);
      return;
    }
  
    const formattedAddress = event.formatted_address || '';
    if (formattedAddress.toLowerCase().includes('tlax')) {
      if (!event.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
  
      if (event.formatted_address) {
        this.reporteForm.patchValue({
          domicilio: event.formatted_address,
        });
      }
  
      const selectedLat = event.geometry?.location?.lat() || this.latitude;
      const selectedLng = event.geometry?.location?.lng() || this.longitude;
  
      this.canvas.setAttribute('data-lat', selectedLat.toString());
      this.canvas.setAttribute('data-lng', selectedLng.toString());
      const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
      this.maps.setCenter(newLatLng);
      this.maps.setZoom(15);
      if (this.marker) {
        this.marker.setMap(null);
      }
      this.marker = new google.maps.Marker({
        position: newLatLng,
        map: this.maps,
        animation: google.maps.Animation.DROP,
        title: event.name,
      });
      this.reporteForm.patchValue({
        longitud: selectedLng,
        latitud: selectedLat,
      });
    } else {
      window.alert('Por favor, selecciona una dirección en Tlaxcala.');
    }
  }
  
  selectAddress2(place: google.maps.places.PlaceResult) {
    const selectedLat = this.reporteForm.value.latitud;
    const selectedLng = this.reporteForm.value.longitud;

    this.canvas.setAttribute('data-lat', selectedLat.toString());
    this.canvas.setAttribute('data-lng', selectedLng.toString());
    const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
    this.maps.setCenter(newLatLng);
    this.maps.setZoom(15);
    if (this.marker) {
      this.marker.setMap(null);
    }
    this.marker = new google.maps.Marker({
      position: newLatLng,
      map: this.maps,
      animation: google.maps.Animation.DROP,
      title: this.reporteForm.value.nombres,
    });
  }
  
  
  verUbicacion(lat: number, lng: number) {
    console.log('Coordenadas seleccionadas:', lat, lng);
  
    this.latitude = lat;
    this.longitude = lng;
  
    // Espera a que el modal esté visible y carga el mapa en el contenedor correcto
    setTimeout(() => {
      // Cambia el nombre de `mapCanvas` a `mapCanvasUbicacion` para este modal
      this.canvas = this.mapCanvasUbicacion.nativeElement;
  
      if (!this.canvas) {
        console.error('El elemento del mapa no fue encontrado');
        return;
      }
  
      const myLatlng = new google.maps.LatLng(this.latitude, this.longitude);
  
      const mapOptions: google.maps.MapOptions = {
        zoom: 15,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };
  
      // Inicializar el mapa en el modal correcto
      this.maps = new google.maps.Map(this.canvas, mapOptions);
  
      // Agregar un marcador en las coordenadas
      new google.maps.Marker({
        position: myLatlng,
        map: this.maps,
        title: 'Ubicación seleccionada',
      });
    }, 300); // Espera 300 ms para asegurar que el modal esté visible
  }
  
  
  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;

    if (!this.canvas) {
      console.error('El elemento del mapa no fue encontrado');
      return;
    }
    const input = this.ubicacionInput.nativeElement;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['geocode'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.selectAddress(place);
    });
    const myLatlng = new google.maps.LatLng(this.latitude, this.longitude);

    const mapOptions = {
      zoom: 13,
      scrollwheel: false,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#444444' }],
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ color: '#f2f2f2' }],
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'road',
          elementType: 'all',
          stylers: [{ saturation: -100 }, { lightness: 45 }],
        },
        {
          featureType: 'road.highway',
          elementType: 'all',
          stylers: [{ visibility: 'simplified' }],
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'all',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#0ba4e2' }, { visibility: 'on' }],
        },
      ],
    };

    this.maps = new google.maps.Map(this.canvas, mapOptions);

    google.maps.event.addListener(
      this.maps,
      'click',
      (event: google.maps.KmlMouseEvent) => {
        this.handleMapClick(event);
      }
    );
  }

  handleMapClick(
    event: google.maps.KmlMouseEvent | google.maps.IconMouseEvent
  ) {
    if (event.latLng) {
      this.latitude = event.latLng.lat();
      this.longitude = event.latLng.lng();
      this.reporteForm.patchValue({
        latitud: this.latitude,
        longitud: this.longitude,
      });
    } else {
      console.error('No se pudo obtener la posición al hacer clic en el mapa.');
    }
    this.adress();
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  mapa() {
    this.setCurrentLocation();
    const dummyPlace: google.maps.places.PlaceResult = {
      geometry: {
        location: new google.maps.LatLng(0, 0),
      },
      formatted_address: '',
      name: '',
    };

    this.selectAddress2(dummyPlace);
  }

  onClear() {
    if (this.Reportes) {
      this.getReportes();
    }
    this.sinAguaMessage = '';
  }

  controlSelect!: Reporte | undefined;
  sinAguaMessage = '';

  onSelectPrograma(id: number | null) {
    this.controlSelect = this.Reportes.find(
      (v) => v.comunidad.id === id
    );

    if (this.controlSelect) {
      const valueSearch2 =
        this.controlSelect.comunidad.nombre.toLowerCase();
      console.log('Search Value:', valueSearch2);

      // Filtrar los votantes
      this.reporteFilter = this.Reportes.filter((personal) =>
        personal.comunidad.nombre
          .toLowerCase()
          .includes(valueSearch2)
      );
      this.sinAguaMessage = '';
      console.log('Filtered usuarios:', this.reporteFilter);

      // Verificar si votantesFilter es null o vacío
      if (!this.reporteFilter || this.reporteFilter.length === 0) {
        this.reporteFilter = [];
      }
      this.configPaginator.currentPage = 1;
    } else {
      this.sinAguaMessage = 'No se encontrarón registros en la comunidad.';
      // Si no se encuentra el votante seleccionado, establecer votantesFilter como un array vacío
      this.reporteFilter = [];
    }
  }

}
