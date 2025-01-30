import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { Fondos } from 'src/app/models/fondos';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FondosService {
  route = `${environment.apiUrl}/fondos`;
  private _refreshListFondos$ = new Subject<Fondos | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListFondos() {
    return this._refreshListFondos$;
  }

  getAll() {
    return this.http.get<Fondos[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Fondos) {
    return this.http.post<Fondos>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListFondos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Fondos) {
    return this.http.put<Fondos>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListFondos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListFondos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
