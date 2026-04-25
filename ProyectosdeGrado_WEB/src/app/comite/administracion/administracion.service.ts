import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import {
  ApiResponse,
  ActualizarPerfilRequest,
  CrearEstudianteRequest,
  CrearDocenteRequest,
  CrearPeriodoRequest,
  CrearProyectoRequest,
  PeriodoAcademicoApi,
  ProyectoApi,
  UsuarioApi,
} from './administracion.types';

@Injectable({ providedIn: 'root' })
export class AdministracionService {
  private readonly api = inject(ApiService);

  private handleError = (error: unknown) => {
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status: number; error?: { error?: string } };
      if (httpError.status === 0) {
        return throwError(() => new Error('No se pudo conectar con el servidor. Verifique su conexión.'));
      }
      if (httpError.status === 400) {
        const detail = httpError.error?.error;
        if (typeof detail === 'string') {
          return throwError(() => new Error(detail));
        }
        if (detail && typeof detail === 'object') {
          const message = Object.entries(detail)
            .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
            .map((value) => String(value))
            .join(' ');
          return throwError(() => new Error(message || 'Datos inválidos. Verifique el formulario.'));
        }
        return throwError(() => new Error('Datos inválidos. Verifique el formulario.'));
      }
      if (httpError.status === 403) {
        return throwError(() => new Error('No tiene permisos para realizar esta acción.'));
      }
    }
    return throwError(() => new Error('Ocurrió un error inesperado. Intente de nuevo.'));
  };

  obtenerUsuarios(filtros?: {
    rol?: string;
    estado?: string;
    busqueda?: string;
  }): Observable<ApiResponse<UsuarioApi[]>> {
    return this.api.get<ApiResponse<UsuarioApi[]>>('usuarios/', filtros).pipe(catchError(this.handleError));
  }

  crearEstudiante(datos: CrearEstudianteRequest): Observable<ApiResponse<UsuarioApi>> {
    return this.api.post<ApiResponse<UsuarioApi>>('usuarios/estudiantes/', datos).pipe(catchError(this.handleError));
  }

  crearDocente(datos: CrearDocenteRequest): Observable<ApiResponse<UsuarioApi>> {
    return this.api.post<ApiResponse<UsuarioApi>>('usuarios/docentes/', datos).pipe(catchError(this.handleError));
  }

  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<ApiResponse<UsuarioApi>> {
    return this.api.patch<ApiResponse<UsuarioApi>>('auth/perfil/', datos).pipe(catchError(this.handleError));
  }

  desactivarUsuario(id: number): Observable<ApiResponse<unknown>> {
    return this.api.patch<ApiResponse<unknown>>(`usuarios/${id}/desactivar/`, {}).pipe(catchError(this.handleError));
  }

  activarUsuario(id: number): Observable<ApiResponse<unknown>> {
    return this.api.patch<ApiResponse<unknown>>(`usuarios/${id}/activar/`, {}).pipe(catchError(this.handleError));
  }

  obtenerPeriodos(): Observable<ApiResponse<PeriodoAcademicoApi[]>> {
    return this.api.get<ApiResponse<PeriodoAcademicoApi[]>>('periodos/').pipe(catchError(this.handleError));
  }

  crearPeriodo(datos: CrearPeriodoRequest): Observable<ApiResponse<PeriodoAcademicoApi>> {
    return this.api.post<ApiResponse<PeriodoAcademicoApi>>('periodos/', datos).pipe(catchError(this.handleError));
  }

  cerrarPeriodo(id: number): Observable<ApiResponse<unknown>> {
    return this.api.patch<ApiResponse<unknown>>(`periodos/${id}/cerrar/`, {}).pipe(catchError(this.handleError));
  }

  obtenerProyectos(filtros?: {
    modalidad?: string;
    estado?: string;
    periodo?: number;
  }): Observable<ApiResponse<ProyectoApi[]>> {
    return this.api.get<ApiResponse<ProyectoApi[]>>('proyectos/', filtros).pipe(catchError(this.handleError));
  }

  crearProyecto(datos: CrearProyectoRequest): Observable<ApiResponse<ProyectoApi>> {
    return this.api.post<ApiResponse<ProyectoApi>>('proyectos/', datos).pipe(catchError(this.handleError));
  }
}