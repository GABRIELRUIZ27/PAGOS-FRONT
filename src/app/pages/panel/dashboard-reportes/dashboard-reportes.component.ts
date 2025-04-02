import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ReportesPorDia } from 'src/app/models/reportes-por-dia';

@Component({
  selector: 'app-dashboard-reportes',
  templateUrl: './dashboard-reportes.component.html',
  styleUrls: ['./dashboard-reportes.component.css']
})
export class DashboardReportesComponent implements OnInit, AfterViewInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  todasLasComunidades: string[] = [
    'Belen Atzitzimititlán',
    'Centro',
    'Tlatempan',
    'San Matias Tepetomatitlan'
  ];
  totalReportes: number = 0;
  totalAtendidos: number = 0;
  porcentajeAtendidos: number = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarReportes();
    this.cargarTotal();
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  cargarTotal(): void {
    this.dashboardService.obtenerTotalReportes().subscribe(data => {
      this.totalReportes = data;
    });

    this.dashboardService.obtenerTotalAtendidos().subscribe(data => {
      this.totalAtendidos = data;
    });

    this.dashboardService.obtenerPorcentajeAtendidos().subscribe(data => {
      this.porcentajeAtendidos = data;
    });
  }

  cargarDatos(): void {
    this.dashboardService.obtenerReportesPorDia().subscribe(data => {
      this.renderChartReportesPorDia(data);
    });
  }

  renderChartReportesPorDia(data: ReportesPorDia[]): void {
    const todasLasFechas = this.generarRangoDeFechas(data);
    const cantidades = todasLasFechas.map(fecha => {
      const reporte = data.find(d => d.fecha === fecha);
      return reporte ? reporte.cantidad : 0;
    });

    this.chartOptions = {
      chart: { type: 'line' },
      title: { text: 'Reportes por día' },
      xAxis: {
        categories: todasLasFechas,
        title: { text: 'Fecha' },
        tickInterval: 1
      },
      yAxis: {
        title: { text: 'Cantidad de reportes' },
        allowDecimals: false
      },
      series: [{
        type: 'line',
        name: 'Cantidad de reportes',
        data: cantidades,
        marker: { enabled: true }
      }]
    };

    this.renderChart();
  }

  renderChart(): void {
    Highcharts.chart('containerReportesPorDia', this.chartOptions);
  }

  generarRangoDeFechas(data: ReportesPorDia[]): string[] {
    if (!data.length) return [];

    const fechas = data.map(d => new Date(d.fecha));
    fechas.sort((a, b) => a.getTime() - b.getTime());

    const fechaInicio = fechas[0];
    const fechaFin = fechas[fechas.length - 1];

    const rangoFechas: string[] = [];
    let fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFin) {
      rangoFechas.push(fechaActual.toISOString().split('T')[0]);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return rangoFechas;
  }

  cargarReportes(): void {
    this.dashboardService.obtenerReportesPorComunidad().subscribe(data => {
      console.log('Datos recibidos:', data);
  
      // Validamos si reportesPorComunidad es un objeto
      if (typeof data === 'object' && data["reportesPorComunidad"] && typeof data["reportesPorComunidad"] === 'object') {
        this.renderChartReportesPorComunidad(data["reportesPorComunidad"] as { [key: string]: number });
      } else {
        console.error('La estructura de datos no es válida:', data);
      }
    });
  }
  
  renderChartReportesPorComunidad(reportes: { [key: string]: number }): void {
    const todasLasComunidades = [
      'Belen Atzitzimititlán',
      'Centro',
      'Tlatempan',
      'San Matias Tepetomatitlan'
    ];
  
    // Aseguramos que todas las comunidades estén presentes en los datos
    const valores = todasLasComunidades.map(comunidad => reportes[comunidad] || 0);
  
    const colores = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F']; // Paleta de colores
  
    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'column',
        renderTo: 'containerReportesPorComunidad' // Asegura el ID correcto
      },
      title: {
        text: 'Reportes por comunidad'
      },
      xAxis: {
        categories: todasLasComunidades,
        title: {
          text: 'Comunidades'
        }
      },
      yAxis: {
        title: {
          text: 'Cantidad de reportes'
        }
      },
      series: [{
        type: 'column',
        name: 'Cantidad de reportes',
        data: valores.map((valor, index) => ({
          y: valor,
          color: colores[index % colores.length] // Asigna un color a cada barra
        }))
      }]
    };
  
    Highcharts.chart('containerReportesPorComunidad', chartOptions); // Renderiza la gráfica
  }
  
}


