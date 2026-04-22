import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProjectModality, StudentProjectProfile } from './student-project.types';
import { LoginRequest, LoginResponse, RolUsuario, SesionActual, Usuario } from './auth.types';

export type UserRole = 'student' | 'professor' | 'jury' | 'committee';

const DEFAULT_PROFILE: StudentProjectProfile = {
  modality: 'interaccion_social',
  socialSubtype: 'proyecto_desarrollo_software',
};

function mapRolSesionToUserRole(rol: RolUsuario | null): UserRole | '' {
  switch (rol) {
    case 'ESTUDIANTE':
      return 'student';
    case 'DOCENTE':
      return 'professor';
    case 'JURADO':
      return 'jury';
    case 'COMITE':
      return 'committee';
    default:
      return '';
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private sesionActual = signal<SesionActual | null>(null);

  readonly isAuthenticated = computed(() => this.estaAutenticado);
  readonly userRole = computed<UserRole | ''>(() => mapRolSesionToUserRole(this.rolSesion));
  readonly studentProjectProfile = signal<StudentProjectProfile>({ ...DEFAULT_PROFILE });

  constructor(private http: HttpClient) {
    this.cargarSesionDesdeStorage();
  }

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, datos).pipe(
      tap((response) => {
        const sesion: SesionActual = {
          usuario: response.datos.usuario,
          rolSesion: response.datos.rol_sesion,
          accessToken: response.datos.access,
          refreshToken: response.datos.refresh,
        };
        this.guardarSesion(sesion);
      }),
    );
  }

  logout(): Observable<unknown> {
    const refresh = this.sesionActual()?.refreshToken;
    this.limpiarSesion();
    if (!refresh) {
      return of(null);
    }

    return this.http.post(`${this.apiUrl}/auth/logout/`, { refresh }).pipe(catchError(() => of(null)));
  }

  refrescarToken(): Observable<string> {
    const refresh = this.sesionActual()?.refreshToken;
    if (!refresh) {
      return throwError(() => new Error('No hay refresh token'));
    }

    return this.http
      .post<{ access?: string; datos?: { access?: string } }>(`${this.apiUrl}/auth/refresh/`, { refresh })
      .pipe(
        map((response) => response.access ?? response.datos?.access ?? ''),
        tap((access) => {
          if (!access) {
            throw new Error('No se recibio un access token valido');
          }

          const sesion = this.sesionActual();
          if (sesion) {
            this.guardarSesion({ ...sesion, accessToken: access });
          }
        }),
      );
  }

  get usuario(): Usuario | null {
    return this.sesionActual()?.usuario ?? null;
  }

  get rolSesion(): RolUsuario | null {
    return this.sesionActual()?.rolSesion ?? null;
  }

  get accessToken(): string | null {
    return this.sesionActual()?.accessToken ?? null;
  }

  get estaAutenticado(): boolean {
    return this.sesionActual() !== null;
  }

  private guardarSesion(sesion: SesionActual): void {
    this.sesionActual.set(sesion);
    localStorage.setItem('sesion', JSON.stringify(sesion));
    this.sincronizarPerfilProyecto(sesion);
  }

  private cargarSesionDesdeStorage(): void {
    const sesionStr = localStorage.getItem('sesion');
    if (!sesionStr) {
      return;
    }

    try {
      const sesion = JSON.parse(sesionStr) as SesionActual;
      this.sesionActual.set(sesion);
      this.sincronizarPerfilProyecto(sesion);
    } catch {
      this.limpiarSesion();
    }
  }

  private limpiarSesion(): void {
    this.sesionActual.set(null);
    this.studentProjectProfile.set({ ...DEFAULT_PROFILE });
    localStorage.removeItem('sesion');
  }

  private sincronizarPerfilProyecto(sesion: SesionActual | null): void {
    if (!sesion || sesion.rolSesion !== 'ESTUDIANTE') {
      this.studentProjectProfile.set({ ...DEFAULT_PROFILE });
      return;
    }

    const modalidadPorDefecto: ProjectModality = 'interaccion_social';
    this.studentProjectProfile.set({
      modality: modalidadPorDefecto,
      socialSubtype: 'proyecto_desarrollo_software',
    });
  }
}
