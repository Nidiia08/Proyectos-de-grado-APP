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
  tipo_documento: string;
  numero_documento: string;
  celular: string;
  roles: RolUsuario[];
  fecha_registro?: string;
}

export interface LoginResponse {
  mensaje: string;
  datos: {
    access: string;
    refresh: string;
    rol_sesion: RolUsuario;
    debe_cambiar_password?: boolean;
    usuario: Usuario;
  };
}

export interface SesionActual {
  usuario: Usuario;
  rolSesion: RolUsuario;
  accessToken: string;
  refreshToken: string;
  debeCambiarPassword: boolean;
}

export interface CambioPasswordRequest {
  password_actual: string;
  password_nuevo: string;
  confirmar_password: string;
}
