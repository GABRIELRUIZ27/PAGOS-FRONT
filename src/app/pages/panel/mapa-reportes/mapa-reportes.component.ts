import { AfterViewInit, Component, Inject } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { ReporteAguaService } from 'src/app/core/services/reporte-fugas.service';
import { Reporte } from 'src/app/models/reportes';
import { HttpClient } from '@angular/common/http';

declare const google: any;

@Component({
  selector: 'app-mapa-reportes',
  templateUrl: './mapa-reportes.component.html',
  styleUrls: ['./mapa-reportes.component.css'],
})
export class MapaReportesComponent implements AfterViewInit {
  map: any = {};
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];
  reportes: Reporte[] = [];
  reportesFiltradas: Reporte[] = [];
  municipioPolygon: google.maps.Polygon | undefined;
  nombreMunicipio: string = 'Apetatitlán de Antonio Carbajal'; 
  municipios: string[] = [];
  filtroSeleccionado: string = 'all';

  constructor(
    @Inject('CONFIG_PAGINATOR')
    public configPaginator: PaginationInstance,
    private reportesService: ReporteAguaService,
    private http: HttpClient
  ) {
    this.getReportes();
    this.cargarNombresMunicipios();
  }

  ngAfterViewInit() {
    const mapElement = document.getElementById('map-canvas') || null;
    const lat = mapElement?.getAttribute('data-lat') || null;
    const lng = mapElement?.getAttribute('data-lng') || null;
    const myLatlng = new google.maps.LatLng(lat, lng);

    const mapOptions = {
      zoom: 10,
      scrollwheel: false,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        // Estilos del mapa
      ],
    };
    this.map = new google.maps.Map(mapElement, mapOptions);
    this.cargarCoordenadasMunicipioSeleccionado();
  }

  cargarNombresMunicipios(): void {
    this.http.get('assets/maps-kml/2023_1_29_MUN.kml', { responseType: 'text' }).subscribe(data => {
      this.parseNombresMunicipios(data);
      this.nombreMunicipio = 'Apetatitlán de Antonio Carvajal';
      this.cargarCoordenadasMunicipioSeleccionado();
    });
  }

  parseNombresMunicipios(kmlData: string): void {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlData, 'text/xml');
    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const extendedData = placemark.getElementsByTagName('ExtendedData')[0];
      if (extendedData) {
        const simpleDatas = extendedData.getElementsByTagName('SimpleData');
        for (let j = 0; j < simpleDatas.length; j++) {
          const simpleData = simpleDatas[j];
          if (simpleData.getAttribute('name') === 'NOMGEO') {
            const municipioNombre = simpleData.textContent;
            if (municipioNombre) {
              this.municipios.push(municipioNombre);
            }
            break;
          }
        }
      }
    }
  }

  cargarCoordenadasMunicipioSeleccionado(): void {
    const selectedMunicipio = this.nombreMunicipio.toLowerCase();
    this.http.get('assets/maps-kml/2023_1_29_MUN.kml', { responseType: 'text' }).subscribe(data => {
      this.parseCoordenadasMunicipio(data, selectedMunicipio);
    });
  }

  parseCoordenadasMunicipio(kmlData: string, selectedMunicipio: string): void {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlData, 'text/xml');
    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const simpleDatas = placemark.getElementsByTagName('SimpleData');
      let municipioNombre: string | undefined;
      let municipioCoordinates: google.maps.LatLngLiteral[] = [];
      for (let j = 0; j < simpleDatas.length; j++) {
        const simpleData = simpleDatas[j];
        if (simpleData.getAttribute('name') === 'NOMGEO') {
          municipioNombre = simpleData.textContent?.toLowerCase();
          if (municipioNombre === selectedMunicipio) {
            const coordinatesText = placemark.getElementsByTagName('coordinates')[0].textContent;
            if (coordinatesText) {
              municipioCoordinates = coordinatesText.split(' ').map(coord => {
                const [lng, lat] = coord.split(',');
                return { lat: parseFloat(lat), lng: parseFloat(lng) };
              });
            }
            break;
          }
        }
      }
      if (municipioCoordinates.length > 0) {
        this.resaltarMunicipio(municipioCoordinates);
        break;
      }
    }
  }

  resaltarMunicipio(coordinates: google.maps.LatLngLiteral[]): void {
    this.limpiarMapa();
    this.municipioPolygon = new google.maps.Polygon({
      paths: coordinates,
      strokeColor: '#D71D1E',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#80ff0000',
      fillOpacity: 0.30
    });
    if (this.municipioPolygon) {
      this.municipioPolygon.setMap(this.map);
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      const center = bounds.getCenter();
      this.map.panTo(center);
      this.map.setZoom(13);
    }
  }

  limpiarMapa(): void {
    if (this.municipioPolygon) {
      this.municipioPolygon.setMap(null);
    }
  }

  getReportes() {
    this.reportesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.reportes = dataFromAPI;
        this.reportesFiltradas = this.reportes;
        this.setAllMarkers();
      },
    });
  }

  setAllMarkers() {
    this.clearMarkers();
    this.reportesFiltradas.forEach((incidencias) => {
      this.setInfoWindow(
        this.getMarker(incidencias),
        this.getContentString(incidencias)
      );
    });
  }

  getContentString(incidencias: Reporte) {
    return `...`; // Aquí va el contenido del infowindow
  }

  getMarker(incidencias: Reporte) {
    const color = incidencias.atendida ? '#008000' : '#FF0000'; 
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        incidencias.latitud,
        incidencias.longitud
      ),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        scale: 6,
        strokeWeight: 0,
      },
    });
    this.markers.push(marker);
    return marker;
  }

  setInfoWindow(marker: any, contentString: string) {
    google.maps.event.addListener(marker, 'click', () => {
      if (this.infowindow && this.infowindow.getMap()) {
        this.infowindow.close();
      }
      this.infowindow.setContent(contentString);
      this.infowindow.setPosition(marker.getPosition());
      this.infowindow.open(this.map, marker);
    });
  }

  onClear() {
    this.setAllMarkers();
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  // Filtrado de puntos por color de estado
  filtrarPuntos(tipo: string) {
    this.clearMarkers();
    let filteredReportes: Reporte[] = [];

    if (tipo === 'green') {
      filteredReportes = this.reportes.filter((incidencia) => incidencia.atendida);
    } else if (tipo === 'red') {
      filteredReportes = this.reportes.filter((incidencia) => !incidencia.atendida);
    } else {
      filteredReportes = this.reportes;
    }

    this.reportesFiltradas = filteredReportes;
    this.setAllMarkers(); // Actualizar los marcadores en el mapa
  }
}
