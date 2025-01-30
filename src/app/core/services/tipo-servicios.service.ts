import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TiposDeServicio } from 'src/app/models/tiposDeServicio';

@Injectable({
  providedIn: 'root',
})
export class TipoServicioService {
  route = `${environment.apiUrl}/tipo-servicio`;
  private _refreshListTiposDeServicio$ = new Subject<TiposDeServicio | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListComunidades() {
    return this._refreshListTiposDeServicio$;
  }

  getAll() {
    return this.http.get<TiposDeServicio[]>(`${this.route}/obtener-todos`);
  }

}
