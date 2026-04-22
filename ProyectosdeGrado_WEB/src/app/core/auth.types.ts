export interface LoginRequest {
  correo: string;
  password: string;
  rol: RolUsuario;
}

export type RolUsuario = 'ESTUDIANTE' | 'DOCENTE' | 'JURADO' | 'COMITE';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  roles: RolUsuario[];
}

export interface LoginResponse {
  mensaje: string;
  datos: {
    access: string;
    refresh: string;
    rol_sesion: RolUsuario;
    usuario: Usuario;
  };
}

export interface SesionActual {
  usuario: Usuario;
  rolSesion: RolUsuario;
  accessToken: string;
  refreshToken: string;
}
