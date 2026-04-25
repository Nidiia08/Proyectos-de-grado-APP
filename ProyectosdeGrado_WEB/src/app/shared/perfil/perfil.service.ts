import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ApiResponse, ActualizarPerfilRequest, UsuarioApi } from '../../comite/administracion/administracion.types';

export interface PerfilUsuarioResponse {
  usuario: UsuarioApi;
  perfil: unknown | null;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly api = inject(ApiService);

  obtenerPerfil(): Observable<ApiResponse<PerfilUsuarioResponse>> {
    return this.api.get<ApiResponse<PerfilUsuarioResponse>>('auth/perfil/');
  }

  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<ApiResponse<UsuarioApi>> {
    return this.api.patch<ApiResponse<UsuarioApi>>('auth/perfil/', datos);
  }
}