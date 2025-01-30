import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-geozona',
  templateUrl: './geozona.component.html',
  styleUrls: ['./geozona.component.css']
})
export class GeozonaComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map!: google.maps.Map;
  municipios: string[] = [];
  nombreMunicipio: string = '';
  municipioCoordinates: google.maps.LatLngLiteral[] = [];
  municipioPolygon: google.maps.Polygon | undefined;

  constructor(private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.cargarNombresMunicipios();
  }

  initMap(): void {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        zoom: 7,
        center: { lat: 19.4326, lng: -99.1332 }
      });
    } else {
      console.error('mapContainer no está definido o es null.');
    }
  }

  cargarNombresMunicipios(): void {
    this.http.get('assets/maps-kml/2023_1_29_MUN.kml', { responseType: 'text' }).subscribe(data => {
      this.parseNombresMunicipios(data);
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
            break; // Detener el bucle una vez que se encuentren las coordenadas
          }
        }
      }
      if (municipioCoordinates.length > 0) {
        this.resaltarMunicipio(municipioCoordinates);
        break; // Detener el bucle una vez que se resalten las coordenadas
      }
    }
  }

  resaltarMunicipio(coordinates: google.maps.LatLngLiteral[]): void {
    // Limpiar el mapa antes de resaltar el nuevo municipio
    this.limpiarMapa();

    console.log('Coordenadas del municipio:', coordinates);
    this.municipioPolygon = new google.maps.Polygon({
      paths: coordinates,
      strokeColor: '#FFFF00', // Amarillo
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#00FF00', // Verde
      fillOpacity: 0.30
    });
    this.municipioPolygon.setMap(this.map);
    console.log('Mapa centrado en:', coordinates[0]);
    this.map.panTo(coordinates[0]);
    this.map.setZoom(11);
    console.log('Zoom del mapa establecido en 11');
  }

  limpiarMapa(): void {
    // Limpiar el polígono anterior, si existe
    if (this.municipioPolygon) {
      this.municipioPolygon.setMap(null);
    }
  }
}
