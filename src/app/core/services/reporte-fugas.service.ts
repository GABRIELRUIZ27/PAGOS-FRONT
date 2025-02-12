import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Observable, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Reporte } from 'src/app/models/reportes';

@Injectable({
  providedIn: 'root',
})
export class ReporteAguaService {
  route = `${environment.apiUrl}/reporte-fugas`;
  private _refreshListReporteAgua$ = new Subject<void>(); // Cambiado a void para actualizar la tabla

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListReporteAgua() {
    return this._refreshListReporteAgua$;
  }

  // Método para crear un reporte
  post(dto: Reporte) {
    return this.http.post<Reporte>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListReporteAgua$.next(); // Notificar actualización
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  // Método para obtener el total de reportes
  getTotalReportes(): Observable<number> {
    return this.http.get<number>(`${this.route}/total`);
  }

  // Método para obtener todos los reportes
  getAll(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${this.route}/obtener-todos`);
  }

  // Método para actualizar el estado "atendida" de un reporte
  updateAtendida(id: number, dto: { atendida: boolean }) {
    return this.http.put(`${this.route}/actualizar-atendida/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListReporteAgua$.next(); // Notificar actualización
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
