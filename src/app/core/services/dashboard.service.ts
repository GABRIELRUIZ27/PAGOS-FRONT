import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ReportesPorDia } from 'src/app/models/reportes-por-dia';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
route = `${environment.apiUrl}/dashboard`;
routetotal = `${environment.apiUrl}/reporte-fugas`;

  private _refreshListFondos$ = new Subject<ReportesPorDia | null>();

  constructor(private http: HttpClient) {}

  obtenerReportesPorDia() {
      return this.http.get<ReportesPorDia[]>(`${this.route}/reportes-por-dia`);
    }

    obtenerReportesPorComunidad() {
      return this.http.get<{ [key: string]: number }>(`${this.route}/reportes-por-comunidad`);
    }

    obtenerTotalReportes(): Observable<number> {
      return this.http.get<number>(`${this.routetotal}/total`);
    }
  
    obtenerTotalAtendidos(): Observable<number> {
      return this.http.get<number>(`${this.routetotal}/total-atendidos`);
    }
  
    obtenerPorcentajeAtendidos(): Observable<number> {
      return this.http.get<number>(`${this.routetotal}/porcentaje-atendidos`);
    }
    
}
