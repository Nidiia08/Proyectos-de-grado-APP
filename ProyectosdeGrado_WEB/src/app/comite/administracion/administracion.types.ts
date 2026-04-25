export interface ApiResponse<T> {
  mensaje: string;
  datos: T;
}

export type RolUsuario = 'ESTUDIANTE' | 'DOCENTE' | 'JURADO' | 'COMITE';

export interface UsuarioApi {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipo_documento: string;
  numero_documento: string;
  celular: string;
  roles: RolUsuario[];
  activo: boolean;
  fecha_registro: string;
  codigo_estudiante?: string;
  programa?: string;
  promedio_acumulado?: number;
  creditos_aprobados?: number;
  codigo_docente?: string;
  area_conocimiento?: string;
  max_proyectos_asesor?: number;
  max_proyectos_jurado?: number;
}

export interface CrearEstudianteRequest {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  tipo_documento: string;
  numero_documento: string;
  celular: string;
  codigo_estudiante: string;
  programa: string;
  promedio_acumulado?: number;
  creditos_aprobados?: number;
}

export interface CrearDocenteRequest {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  tipo_documento: string;
  numero_documento: string;
  celular: string;
  roles: ('DOCENTE' | 'JURADO')[];
  codigo_docente: string;
  area_conocimiento?: string;
}

export interface ActualizarPerfilRequest {
  nombre?: string;
  apellido?: string;
  tipo_documento?: string;
  numero_documento?: string;
  celular?: string;
}

export interface PeriodoAcademicoApi {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface CrearPeriodoRequest {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface EstudianteAsignadoApi {
  estudiante_id: number;
  es_autor_principal: boolean;
  nombre?: string;
}

export interface ProyectoApi {
  id: number;
  nombre: string;
  modalidad: 'INVESTIGACION' | 'INTERACCION_SOCIAL';
  subtipo?: 'PASANTIA' | 'DESARROLLO_SOFTWARE' | 'INTERVENCION';
  estado: string;
  fase_actual: string;
  periodo_academico_id: number;
  asesor_id: number;
  es_grupo: boolean;
  es_interdisciplinario: boolean;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  estudiantes: EstudianteAsignadoApi[];
  asesor_nombre?: string;
  coasesor_nombre?: string;
  periodo_nombre?: string;
}

export interface CrearProyectoRequest {
  nombre: string;
  modalidad: string;
  subtipo?: string;
  periodo_academico_id: number;
  asesor_id: number;
  coasesor_id?: number | null;
  es_grupo: boolean;
  es_interdisciplinario: boolean;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  estudiantes: { estudiante_id: number; es_autor_principal: boolean }[];
}

export interface Plazos {
  revisionJuradosInscripcion: number;
  ajustesInvestigacion1: number;
  ajustesInvestigacion23: number;
  ajustesInteraccion1: number;
  ajustesInteraccion2: number;
  revisionInformeFinal: number;
  ajustesEvaluacion1: number;
  ajustesEvaluacion2: number;
  duracionInvestigacionMeses: number;
  duracionInteraccionMinMeses: number;
  duracionInteraccionMaxMeses: number;
  duracionMaximaProrrogaMeses: number;
}

export interface Parametros {
  nombreDepartamento: string;
  correo: string;
  directorDepartamento: string;
  maxProyectosAsesor: number;
  maxProyectosJurado: number;
  minimoAsistentes: number;
  ultimaModificacion?: string;
}

export const PLAZOS_DEFECTO: Plazos = {
  revisionJuradosInscripcion: 5,
  ajustesInvestigacion1: 10,
  ajustesInvestigacion23: 5,
  ajustesInteraccion1: 15,
  ajustesInteraccion2: 5,
  revisionInformeFinal: 20,
  ajustesEvaluacion1: 10,
  ajustesEvaluacion2: 5,
  duracionInvestigacionMeses: 6,
  duracionInteraccionMinMeses: 6,
  duracionInteraccionMaxMeses: 12,
  duracionMaximaProrrogaMeses: 24,
};

export const PARAMETROS_DEFECTO: Parametros = {
  nombreDepartamento: 'Departamento de Ingeniería de Sistemas',
  correo: 'insistemas@udenar.edu.co',
  directorDepartamento: 'Dr. Ricardo Enríquez',
  maxProyectosAsesor: 6,
  maxProyectosJurado: 5,
  minimoAsistentes: 10,
};

export function crearEstudianteRequest(formValue: {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  tipo_documento: string;
  numero_documento: string;
  celular: string;
  codigo_estudiante: string;
  programa: string;
  promedio_acumulado?: number | null;
  creditos_aprobados?: number | null;
}): CrearEstudianteRequest {
  return {
    nombre: formValue.nombre,
    apellido: formValue.apellido,
    correo: formValue.correo,
    password: formValue.password,
    tipo_documento: formValue.tipo_documento,
    numero_documento: formValue.numero_documento,
    celular: formValue.celular,
    codigo_estudiante: formValue.codigo_estudiante,
    programa: formValue.programa,
    promedio_acumulado: formValue.promedio_acumulado ?? undefined,
    creditos_aprobados: formValue.creditos_aprobados ?? undefined,
  };
}

export function crearDocenteRequest(formValue: {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  tipo_documento: string;
  numero_documento: string;
  celular: string;
  rol: string;
  codigo_docente: string;
  area_conocimiento?: string;
}): CrearDocenteRequest {
  const roles: ('DOCENTE' | 'JURADO')[] = formValue.rol === 'JURADO'
    ? ['DOCENTE', 'JURADO']
    : formValue.rol === 'COMITE'
    ? []
    : ['DOCENTE'];
  
  return {
    nombre: formValue.nombre,
    apellido: formValue.apellido,
    correo: formValue.correo,
    password: formValue.password,
    tipo_documento: formValue.tipo_documento,
    numero_documento: formValue.numero_documento,
    celular: formValue.celular,
    roles,
    codigo_docente: formValue.codigo_docente,
    area_conocimiento: formValue.area_conocimiento || undefined,
  };
}