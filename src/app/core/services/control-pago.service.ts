import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { ControlAgua } from 'src/app/models/control-agua';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ControlPagoService {
  route = `${environment.apiUrl}/padron-agua`;
  private _refreshListControlAgua$ = new Subject<ControlAgua | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListControlAgua() {
    return this._refreshListControlAgua$;
  }

  getAll() {
    return this.http.get<ControlAgua[]>(`${this.route}/obtener-todos`);
  }

  post(dto: ControlAgua) {
    return this.http.post<ControlAgua>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListControlAgua$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: ControlAgua) {
    return this.http.put<ControlAgua>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListControlAgua$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
