import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { Agua } from 'src/app/models/agua';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AguaService {
  route = `${environment.apiUrl}/agua-potable`;
  private _refreshListAgua$ = new Subject<Agua | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListAgua() {
    return this._refreshListAgua$;
  }

  getAll() {
    return this.http.get<Agua[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Agua) {
    return this.http.post<Agua>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListAgua$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Agua) {
    return this.http.put<Agua>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListAgua$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListAgua$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
