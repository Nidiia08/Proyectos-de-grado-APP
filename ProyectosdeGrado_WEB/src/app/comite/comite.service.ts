import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';

export enum ComiteFaseProyecto {
  Inscripcion = 'inscripcion',
  Aprobacion = 'aprobacion',
  Desarrollo = 'desarrollo',
  Culminacion = 'culminacion',
  Evaluacion = 'evaluacion',
  Finalizado = 'finalizado',
}

export enum ComiteEstadoProyecto {
  PendienteRevision = 'pendiente_revision',
  EnCurso = 'en_curso',
  PendienteJurados = 'pendiente_jurados',
  PendienteProgramacion = 'pendiente_programacion',
  PendienteActaFinal = 'pendiente_acta_final',
  ConProrroga = 'con_prorroga',
  Finalizado = 'finalizado',
  Cancelado = 'cancelado',
  Reprobado = 'reprobado',
}

export interface ComitePerfil {
  id: number;
  nombre: string;
  periodoActivo: string;
  fechaActual: string;
}

export interface AcuerdoComite {
  id: number;
  numero: string;
  fecha: string;
  tipo: string;
  descripcion: string;
}

export interface DocumentoComite {
  id: number;
  nombre: string;
  estado: string;
  fecha: string;
}

export interface IteracionComite {
  id: number;
  numero: number;
  estado: string;
  documento: string;
  observacionesJurados: string[];
  diasRestantes: number;
}

export interface InformeComite {
  id: number;
  numero: number;
  periodo: string;
  archivo: string;
  estado: string;
  fechaLimite: string;
  observacion?: string;
}

export interface ProrrogaComite {
  id: number;
  fecha: string;
  nuevaFecha: string;
  motivo: string;
}

export interface JuradoAsignado {
  id: number;
  nombre: string;
  area: string;
  cargaActual: number;
}

export interface HistorialComiteProyecto {
  id: number;
  fechaHora: string;
  accion: string;
  detalle: string;
  usuario: string;
}

export interface NotaJurado {
  jurado: string;
  nota: number;
  fecha: string;
}

interface UsuarioComiteApi {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  roles: string[];
  activo: boolean;
  fecha_registro: string;
}

export interface ProyectoComite {
  id: number;
  nombre: string;
  estudiantes: string[];
  asesor: string;
  modalidad: string;
  subtipo: string;
  periodo: string;
  faseActual: ComiteFaseProyecto;
  estado: ComiteEstadoProyecto;
  fechaInicio: string;
  fechaLimite: string;
  ultimaActividad: string;
  grupoInvestigacion?: string;
  infoGeneral: {
    comentarioEstudiante: string;
    observacionesComite: string;
  };
  inscripcion: {
    documentos: DocumentoComite[];
    fechaLimite: string;
    observaciones: string;
    juradosRevisores: JuradoAsignado[];
  };
  aprobacion: {
    iteraciones: IteracionComite[];
    diasRestantes: number;
    actaCompromiso?: string;
  };
  desarrollo: {
    informes: InformeComite[];
    prorrogas: ProrrogaComite[];
  };
  culminacion: {
    documentos: DocumentoComite[];
    enlaceNube?: string;
    cartaAsesor: boolean;
    avalEntidad: boolean;
    juradosEvaluadores: JuradoAsignado[];
  };
  evaluacion: {
    sustentacionPrivada?: string;
    socializacionPublica?: string;
    asistentesSocializacion: number;
    calificaciones: NotaJurado[];
    clasificacionRevista?: 'A1' | 'A' | 'B' | 'C';
    notaFinal?: number;
    conceptoFinal?: 'Aprobado' | 'Reprobado' | 'Meritorio' | 'Laureado';
    actaFinalGenerada: boolean;
    avalesPendientes: boolean;
  };
  acuerdos: AcuerdoComite[];
  historial: HistorialComiteProyecto[];
}

export interface AlertaComite {
  id: number;
  projectId: number;
  estudiante: string;
  proyecto: string;
  fase: string;
  accion: string;
  diasRestantes?: number;
  destino: 'projects' | 'reports' | 'administration';
  prioridad: number;
}

export interface PlantillaComite {
  id: number;
  nombre: string;
  categoria: string;
  fase: string;
  modalidadAplica: string;
  ultimaActualizacion: string;
}

export type TipoNotificacionComite =
  | 'nuevo_proyecto'
  | 'documentos_inscripcion'
  | 'refrendo_asesor'
  | 'revision_jurado'
  | 'aval_sustentacion'
  | 'calificacion_jurado'
  | 'informe_trimestral'
  | 'documentos_culminacion'
  | 'fecha_vencida'
  | 'prorroga';

export interface NotificacionComite {
  id: number;
  tipo: TipoNotificacionComite;
  titulo: string;
  descripcion: string;
  proyecto: string;
  estudiante: string;
  projectId: number;
  fase: string;
  modalidad: string;
  fechaHora: string;
  leida: boolean;
}

export interface UsuarioSistema {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string;
}

export interface RolPermisos {
  rol: string;
  permisos: string[];
}

export interface PeriodoAcademico {
  id: number;
  nombre: string;
  inicio: string;
  fin: string;
  estado: 'Activo' | 'Cerrado';
}

export interface PlazosDefecto {
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

export interface ParametrosGenerales {
  nombreDepartamento: string;
  correo: string;
  directorDepartamento: string;
  maxProyectosAsesor: number;
  maxProyectosJurado: number;
  minimoAsistentes: number;
  revistas: Record<string, number>;
}

const NOW = '2026-04-12T10:30:00-05:00';

function nowIso(): string {
  return new Date(NOW).toISOString();
}

function createAvailableJuries(): JuradoAsignado[] {
  return [
    { id: 1, nombre: 'Dra. Mónica Cabrera', area: 'Ingeniería de Software', cargaActual: 2 },
    { id: 2, nombre: 'Dr. Jaime Guerrero', area: 'Ciencia de Datos', cargaActual: 1 },
    { id: 3, nombre: 'Mg. Elena Erazo', area: 'Interacción Social', cargaActual: 3 },
    { id: 4, nombre: 'Dr. Andrés Valencia', area: 'Sistemas Inteligentes', cargaActual: 2 },
  ];
}

function createProjects(): ProyectoComite[] {
  const juries = createAvailableJuries();
  return [
    {
      id: 301,
      nombre: 'Analítica predictiva para permanencia estudiantil',
      estudiantes: ['Laura Benavides', 'Kevin Rosero'],
      asesor: 'Dra. María Fernanda Rosero',
      modalidad: 'Investigación',
      subtipo: 'Grupo de investigación',
      periodo: '2026-A',
      faseActual: ComiteFaseProyecto.Inscripcion,
      estado: ComiteEstadoProyecto.PendienteJurados,
      fechaInicio: '2026-02-10',
      fechaLimite: '2026-04-15',
      ultimaActividad: '2026-04-11T14:00:00-05:00',
      grupoInvestigacion: 'Analítica y Datos',
      infoGeneral: { comentarioEstudiante: 'Se presenta propuesta con enfoque en permanencia estudiantil.', observacionesComite: '' },
      inscripcion: {
        documentos: [
          { id: 1, nombre: 'Propuesta de trabajo de grado.pdf', estado: 'Recibido', fecha: '2026-04-11' },
          { id: 2, nombre: 'Aval del director y grupo.pdf', estado: 'Refrendado por asesor', fecha: '2026-04-11' },
        ],
        fechaLimite: '2026-04-15',
        observaciones: '',
        juradosRevisores: [],
      },
      aprobacion: { iteraciones: [], diasRestantes: 5 },
      desarrollo: { informes: [], prorrogas: [] },
      culminacion: { documentos: [], cartaAsesor: false, avalEntidad: false, juradosEvaluadores: [] },
      evaluacion: { asistentesSocializacion: 0, calificaciones: [], actaFinalGenerada: false, avalesPendientes: false },
      acuerdos: [],
      historial: [],
    },
    {
      id: 302,
      nombre: 'Plataforma web para seguimiento de egresados',
      estudiantes: ['Camila Rosero'],
      asesor: 'Dr. Jairo Meneses',
      modalidad: 'Interacción Social',
      subtipo: 'Proyecto de Desarrollo de Software',
      periodo: '2026-A',
      faseActual: ComiteFaseProyecto.Aprobacion,
      estado: ComiteEstadoProyecto.EnCurso,
      fechaInicio: '2026-01-20',
      fechaLimite: '2026-04-14',
      ultimaActividad: '2026-04-10T09:30:00-05:00',
      infoGeneral: { comentarioEstudiante: 'Ajustes entregados tras observaciones de jurados.', observacionesComite: 'Pendiente seguimiento de iteración 2.' },
      inscripcion: {
        documentos: [{ id: 3, nombre: 'Acta de inscripción.pdf', estado: 'Aprobada', fecha: '2026-02-01' }],
        fechaLimite: '2026-02-01',
        observaciones: '',
        juradosRevisores: [juries[0], juries[1]],
      },
      aprobacion: {
        iteraciones: [
          { id: 1, numero: 1, estado: 'Observaciones emitidas', documento: 'propuesta_v1.pdf', observacionesJurados: ['Ajustar alcance', 'Clarificar entregables'], diasRestantes: 0 },
          { id: 2, numero: 2, estado: 'Esperando refrendo del asesor', documento: 'ajustes_iteracion_2.pdf', observacionesJurados: ['Pendiente revisión final'], diasRestantes: 2 },
        ],
        diasRestantes: 2,
      },
      desarrollo: { informes: [], prorrogas: [] },
      culminacion: { documentos: [], cartaAsesor: false, avalEntidad: false, juradosEvaluadores: [] },
      evaluacion: { asistentesSocializacion: 0, calificaciones: [], actaFinalGenerada: false, avalesPendientes: false },
      acuerdos: [{ id: 1, numero: 'CC-2026-014', fecha: '2026-02-02', tipo: 'Aprobación de inscripción', descripcion: 'Se asignaron jurados revisores.' }],
      historial: [],
    },
    {
      id: 303,
      nombre: 'Modelo de intervención TIC para asociaciones rurales',
      estudiantes: ['Sebastián Enríquez'],
      asesor: 'Mg. Paola Ibarra',
      modalidad: 'Interacción Social',
      subtipo: 'Proyecto de Intervención',
      periodo: '2026-A',
      faseActual: ComiteFaseProyecto.Desarrollo,
      estado: ComiteEstadoProyecto.ConProrroga,
      fechaInicio: '2025-10-01',
      fechaLimite: '2026-07-30',
      ultimaActividad: '2026-04-09T16:00:00-05:00',
      infoGeneral: { comentarioEstudiante: 'Se adjuntó informe trimestral número 2.', observacionesComite: '' },
      inscripcion: { documentos: [{ id: 4, nombre: 'Inscripción.pdf', estado: 'Aprobada', fecha: '2025-10-01' }], fechaLimite: '2025-10-01', observaciones: '', juradosRevisores: [juries[2], juries[3]] },
      aprobacion: { iteraciones: [], diasRestantes: 0 },
      desarrollo: {
        informes: [
          { id: 1, numero: 1, periodo: 'Octubre - Diciembre 2025', archivo: 'informe_1.pdf', estado: 'Aprobado', fechaLimite: '2026-01-10' },
          { id: 2, numero: 2, periodo: 'Enero - Marzo 2026', archivo: 'informe_2.pdf', estado: 'Pendiente revisión', fechaLimite: '2026-04-12' },
        ],
        prorrogas: [{ id: 1, fecha: '2026-03-20', nuevaFecha: '2026-07-30', motivo: 'Ampliación por trabajo comunitario.' }],
      },
      culminacion: { documentos: [], cartaAsesor: false, avalEntidad: false, juradosEvaluadores: [] },
      evaluacion: { asistentesSocializacion: 0, calificaciones: [], actaFinalGenerada: false, avalesPendientes: false },
      acuerdos: [],
      historial: [],
    },
    {
      id: 304,
      nombre: 'Pasantía de automatización de reportes empresariales',
      estudiantes: ['Valentina Muñoz'],
      asesor: 'Dr. Julián Melo',
      modalidad: 'Interacción Social',
      subtipo: 'Pasantía',
      periodo: '2026-A',
      faseActual: ComiteFaseProyecto.Culminacion,
      estado: ComiteEstadoProyecto.PendienteJurados,
      fechaInicio: '2025-08-20',
      fechaLimite: '2026-04-16',
      ultimaActividad: '2026-04-11T11:00:00-05:00',
      infoGeneral: { comentarioEstudiante: 'Se adjuntan documentos finales y aval de entidad.', observacionesComite: '' },
      inscripcion: { documentos: [{ id: 5, nombre: 'Inscripción pasantía.pdf', estado: 'Aprobada', fecha: '2025-08-25' }], fechaLimite: '2025-08-25', observaciones: '', juradosRevisores: [juries[1], juries[2]] },
      aprobacion: { iteraciones: [], diasRestantes: 0, actaCompromiso: 'acta_compromiso_entidad.pdf' },
      desarrollo: { informes: [], prorrogas: [] },
      culminacion: {
        documentos: [
          { id: 6, nombre: 'Informe final.pdf', estado: 'Recibido', fecha: '2026-04-11' },
          { id: 7, nombre: 'Carta del asesor.pdf', estado: 'Verificada', fecha: '2026-04-11' },
          { id: 8, nombre: 'Aval entidad receptora.pdf', estado: 'Verificado', fecha: '2026-04-11' },
        ],
        enlaceNube: 'https://drive.google.com/mock-pasantia',
        cartaAsesor: true,
        avalEntidad: true,
        juradosEvaluadores: [],
      },
      evaluacion: { asistentesSocializacion: 0, calificaciones: [], actaFinalGenerada: false, avalesPendientes: true },
      acuerdos: [],
      historial: [],
    },
    {
      id: 305,
      nombre: 'Clasificación automática de artículos científicos',
      estudiantes: ['Juliana Ortiz', 'Mateo Realpe'],
      asesor: 'Dra. Alejandra Portilla',
      modalidad: 'Investigación',
      subtipo: 'Revista indexada',
      periodo: '2026-A',
      faseActual: ComiteFaseProyecto.Evaluacion,
      estado: ComiteEstadoProyecto.PendienteActaFinal,
      fechaInicio: '2025-07-10',
      fechaLimite: '2026-04-18',
      ultimaActividad: '2026-04-10T18:20:00-05:00',
      grupoInvestigacion: 'Computación Aplicada',
      infoGeneral: { comentarioEstudiante: 'Artículo aceptado en revista indexada.', observacionesComite: '' },
      inscripcion: { documentos: [{ id: 9, nombre: 'Inscripción investigación.pdf', estado: 'Aprobada', fecha: '2025-07-12' }], fechaLimite: '2025-07-12', observaciones: '', juradosRevisores: [juries[0], juries[3]] },
      aprobacion: { iteraciones: [], diasRestantes: 0 },
      desarrollo: { informes: [], prorrogas: [] },
      culminacion: { documentos: [{ id: 10, nombre: 'Artículo final.pdf', estado: 'Aprobado', fecha: '2026-03-28' }], cartaAsesor: true, avalEntidad: false, juradosEvaluadores: [juries[0], juries[1]] },
      evaluacion: {
        sustentacionPrivada: '2026-04-14T09:00:00-05:00',
        socializacionPublica: '2026-04-14T11:00:00-05:00',
        asistentesSocializacion: 12,
        calificaciones: [
          { jurado: 'Dra. Mónica Cabrera', nota: 96, fecha: '2026-04-10T15:00:00-05:00' },
          { jurado: 'Dr. Jaime Guerrero', nota: 94, fecha: '2026-04-10T16:00:00-05:00' },
        ],
        clasificacionRevista: 'A',
        notaFinal: 95,
        conceptoFinal: 'Meritorio',
        actaFinalGenerada: false,
        avalesPendientes: false,
      },
      acuerdos: [],
      historial: [],
    },
    {
      id: 306,
      nombre: 'Sistema de apoyo para prácticas de laboratorio',
      estudiantes: ['Andrea Coral'],
      asesor: 'Dr. Andrés Valencia',
      modalidad: 'Interacción Social',
      subtipo: 'Proyecto de Desarrollo de Software',
      periodo: '2026-A',
      faseActual: ComiteFaseProyecto.Finalizado,
      estado: ComiteEstadoProyecto.Finalizado,
      fechaInicio: '2025-03-01',
      fechaLimite: '2026-03-25',
      ultimaActividad: '2026-03-25T17:00:00-05:00',
      infoGeneral: { comentarioEstudiante: 'Proyecto finalizado.', observacionesComite: '' },
      inscripcion: { documentos: [], fechaLimite: '2025-03-10', observaciones: '', juradosRevisores: [] },
      aprobacion: { iteraciones: [], diasRestantes: 0 },
      desarrollo: { informes: [], prorrogas: [] },
      culminacion: { documentos: [], cartaAsesor: true, avalEntidad: false, juradosEvaluadores: [] },
      evaluacion: { asistentesSocializacion: 14, calificaciones: [], actaFinalGenerada: true, avalesPendientes: false, notaFinal: 88, conceptoFinal: 'Aprobado' },
      acuerdos: [],
      historial: [],
    },
  ];
}

function createTemplates(): PlantillaComite[] {
  return [
    { id: 1, nombre: 'Propuesta de trabajo de grado', categoria: 'Inscripción', fase: 'Inscripción', modalidadAplica: 'Todas', ultimaActualizacion: '2026-03-02' },
    { id: 2, nombre: 'Aval del director y grupo de investigación', categoria: 'Inscripción', fase: 'Inscripción', modalidadAplica: 'Solo Investigación', ultimaActualizacion: '2026-02-18' },
    { id: 3, nombre: 'Aval de jurados revisores', categoria: 'Aprobación', fase: 'Aprobación', modalidadAplica: 'Todas', ultimaActualizacion: '2026-01-10' },
    { id: 4, nombre: 'Plantilla de informe trimestral', categoria: 'Desarrollo', fase: 'Desarrollo', modalidadAplica: 'Todas', ultimaActualizacion: '2026-02-01' },
    { id: 5, nombre: 'Carta del director/asesor de cumplimiento de objetivos', categoria: 'Culminación', fase: 'Culminación', modalidadAplica: 'Todas', ultimaActualizacion: '2026-01-20' },
    { id: 6, nombre: 'Acta de evaluación final', categoria: 'Evaluación', fase: 'Evaluación', modalidadAplica: 'Todas', ultimaActualizacion: '2026-01-28' },
  ];
}

function createNotifications(): NotificacionComite[] {
  return [
    { id: 1, tipo: 'nuevo_proyecto', titulo: 'Nuevo proyecto inscrito', descripcion: 'Un estudiante registró un nuevo proyecto.', proyecto: 'Analítica predictiva para permanencia estudiantil', estudiante: 'Laura Benavides, Kevin Rosero', projectId: 301, fase: 'Inscripción', modalidad: 'Investigación', fechaHora: '2026-04-11T14:00:00-05:00', leida: false },
    { id: 2, tipo: 'refrendo_asesor', titulo: 'Asesor refrendó ajustes', descripcion: 'El asesor refrendó la iteración pendiente.', proyecto: 'Plataforma web para seguimiento de egresados', estudiante: 'Camila Rosero', projectId: 302, fase: 'Aprobación', modalidad: 'Interacción Social', fechaHora: '2026-04-10T10:00:00-05:00', leida: false },
    { id: 3, tipo: 'informe_trimestral', titulo: 'Informe trimestral enviado', descripcion: 'Se cargó un nuevo informe trimestral.', proyecto: 'Modelo de intervención TIC para asociaciones rurales', estudiante: 'Sebastián Enríquez', projectId: 303, fase: 'Desarrollo', modalidad: 'Interacción Social', fechaHora: '2026-04-09T16:00:00-05:00', leida: false },
    { id: 4, tipo: 'documentos_culminacion', titulo: 'Documentos de culminación recibidos', descripcion: 'El estudiante cargó documentos finales.', proyecto: 'Pasantía de automatización de reportes empresariales', estudiante: 'Valentina Muñoz', projectId: 304, fase: 'Culminación', modalidad: 'Pasantía', fechaHora: '2026-04-11T11:00:00-05:00', leida: false },
    { id: 5, tipo: 'calificacion_jurado', titulo: 'Calificaciones completas', descripcion: 'Ambos jurados registraron calificación final.', proyecto: 'Clasificación automática de artículos científicos', estudiante: 'Juliana Ortiz, Mateo Realpe', projectId: 305, fase: 'Evaluación', modalidad: 'Investigación', fechaHora: '2026-04-10T18:20:00-05:00', leida: true },
  ];
}

function createUsers(): UsuarioSistema[] {
  return [
    { id: 1, nombre: 'Laura Benavides', correo: 'laura.benavides@udenar.edu.co', rol: 'Estudiante', estado: 'Activo', fechaRegistro: '2026-01-15' },
    { id: 2, nombre: 'Dra. María Fernanda Rosero', correo: 'mrosero@udenar.edu.co', rol: 'Asesor/Director', estado: 'Activo', fechaRegistro: '2025-08-01' },
    { id: 3, nombre: 'Dr. Carlos Andrés Velasco', correo: 'cvelasco@udenar.edu.co', rol: 'Jurado Evaluador', estado: 'Activo', fechaRegistro: '2025-08-01' },
    { id: 4, nombre: 'Mg. Sandra Muñoz', correo: 'smunoz@udenar.edu.co', rol: 'Comité Curricular', estado: 'Activo', fechaRegistro: '2025-07-20' },
  ];
}

function createRoles(): RolPermisos[] {
  return [
    { rol: 'Estudiante', permisos: ['ver', 'crear', 'editar'] },
    { rol: 'Comité Curricular', permisos: ['ver', 'crear', 'editar', 'aprobar', 'administrar'] },
    { rol: 'Asesor/Director', permisos: ['ver', 'editar', 'aprobar'] },
    { rol: 'Jurado Evaluador', permisos: ['ver', 'aprobar', 'calificar'] },
  ];
}

function createPeriods(): PeriodoAcademico[] {
  return [
    { id: 1, nombre: '2025-B', inicio: '2025-08-01', fin: '2025-12-20', estado: 'Cerrado' },
    { id: 2, nombre: '2026-A', inicio: '2026-01-20', fin: '2026-06-30', estado: 'Activo' },
  ];
}

@Injectable({
  providedIn: 'root',
})
export class ComiteService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;
  private readonly perfilSignal = signal<ComitePerfil>({
    id: 1,
    nombre: 'Mg. Sandra Muñoz',
    periodoActivo: '2026-A',
    fechaActual: nowIso(),
  });
  private readonly projects = signal<ProyectoComite[]>(createProjects());
  private readonly templates = signal<PlantillaComite[]>(createTemplates());
  private readonly notifications = signal<NotificacionComite[]>(createNotifications());
  private readonly users = signal<UsuarioSistema[]>(createUsers());
  private readonly roles = signal<RolPermisos[]>(createRoles());
  private readonly periods = signal<PeriodoAcademico[]>(createPeriods());
  private readonly availableJuries = signal<JuradoAsignado[]>(createAvailableJuries());
  private readonly defaultDeadlines = signal<PlazosDefecto>({
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
  });
  private readonly generalParams = signal<ParametrosGenerales>({
    nombreDepartamento: 'Departamento de Ingeniería de Sistemas',
    correo: 'insistemas@udenar.edu.co',
    directorDepartamento: 'Dr. Ricardo Enríquez',
    maxProyectosAsesor: 6,
    maxProyectosJurado: 5,
    minimoAsistentes: 10,
    revistas: { A1: 100, A: 100, B: 90, C: 80 },
  });
  readonly selectedProjectId = signal<number | null>(301);

  readonly perfil = computed(() => {
    const role = this.auth.userRole();
    const base = this.perfilSignal();
    if (role === 'committee') {
      const usuario = this.auth.usuario;
      if (usuario) {
        return { ...base, nombre: `${usuario.nombre} ${usuario.apellido}`.trim() };
      }
      return base;
    }
    return { ...base, nombre: 'Miembro de comité de prueba' };
  });
  readonly proyectos = computed(() => this.projects());
  readonly proyectosRecientes = computed(() => [...this.projects()].sort((a, b) => +new Date(b.ultimaActividad) - +new Date(a.ultimaActividad)).slice(0, 10));
  readonly plantillas = computed(() => this.templates());
  readonly notificaciones = computed(() => [...this.notifications()].sort((a, b) => +new Date(b.fechaHora) - +new Date(a.fechaHora)));
  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.leida).length);
  readonly usuarios = computed(() => this.users());
  readonly rolesPermisos = computed(() => this.roles());
  readonly periodos = computed(() => this.periods());
  readonly juradosDisponibles = computed(() => this.availableJuries());
  readonly plazosDefecto = computed(() => this.defaultDeadlines());
  readonly parametrosGenerales = computed(() => this.generalParams());
  readonly selectedProject = computed(() => this.projects().find((p) => p.id === this.selectedProjectId()) ?? this.projects()[0] ?? null);

  readonly metrics = computed(() => {
    const data = this.projects();
    return {
      activos: data.filter((p) => p.estado !== ComiteEstadoProyecto.Finalizado).length,
      inscripcion: data.filter((p) => p.faseActual === ComiteFaseProyecto.Inscripcion).length,
      aprobacion: data.filter((p) => p.faseActual === ComiteFaseProyecto.Aprobacion).length,
      desarrollo: data.filter((p) => p.faseActual === ComiteFaseProyecto.Desarrollo).length,
      culminacion: data.filter((p) => p.faseActual === ComiteFaseProyecto.Culminacion).length,
      evaluacion: data.filter((p) => p.faseActual === ComiteFaseProyecto.Evaluacion).length,
      finalizados: data.filter((p) => p.faseActual === ComiteFaseProyecto.Finalizado).length,
    };
  });

  readonly alerts = computed<AlertaComite[]>(() => {
    const alerts: AlertaComite[] = [];
    for (const project of this.projects()) {
      if (project.faseActual === ComiteFaseProyecto.Inscripcion && project.inscripcion.juradosRevisores.length === 0) {
        alerts.push({ id: Number(`${project.id}1`), projectId: project.id, estudiante: project.estudiantes.join(', '), proyecto: project.nombre, fase: 'Inscripción', accion: 'Asignar jurados revisores y aprobar inscripción', diasRestantes: this.daysUntil(project.fechaLimite), destino: 'projects', prioridad: 1 });
      }
      const days = this.daysUntil(project.fechaLimite);
      if (days <= 3 && project.estado !== ComiteEstadoProyecto.Finalizado) {
        alerts.push({ id: Number(`${project.id}2`), projectId: project.id, estudiante: project.estudiantes.join(', '), proyecto: project.nombre, fase: this.getPhaseLabel(project.faseActual), accion: 'Revisar plazo del proyecto', diasRestantes: days, destino: 'projects', prioridad: 2 });
      }
      if (project.aprobacion.iteraciones.some((item) => item.estado.includes('asesor'))) {
        alerts.push({ id: Number(`${project.id}3`), projectId: project.id, estudiante: project.estudiantes.join(', '), proyecto: project.nombre, fase: 'Aprobación', accion: 'Dar seguimiento a ajustes esperando refrendo del asesor', diasRestantes: project.aprobacion.diasRestantes, destino: 'projects', prioridad: 3 });
      }
      if (project.evaluacion.avalesPendientes && !project.evaluacion.sustentacionPrivada) {
        alerts.push({ id: Number(`${project.id}4`), projectId: project.id, estudiante: project.estudiantes.join(', '), proyecto: project.nombre, fase: 'Evaluación', accion: 'Programar fecha de sustentación', destino: 'projects', prioridad: 4 });
      }
      if (project.evaluacion.calificaciones.length >= 2 && !project.evaluacion.actaFinalGenerada) {
        alerts.push({ id: Number(`${project.id}5`), projectId: project.id, estudiante: project.estudiantes.join(', '), proyecto: project.nombre, fase: 'Evaluación', accion: 'Generar acta final de evaluación', destino: 'projects', prioridad: 5 });
      }
    }
    return alerts.sort((a, b) => a.prioridad - b.prioridad);
  });

  readonly chartSummary = computed(() => ({
    fases: {
      labels: ['Inscripción', 'Aprobación', 'Desarrollo', 'Culminación', 'Evaluación', 'Finalizado'],
      data: [this.metrics().inscripcion, this.metrics().aprobacion, this.metrics().desarrollo, this.metrics().culminacion, this.metrics().evaluacion, this.metrics().finalizados],
    },
    modalidades: {
      labels: ['Investigación', 'Pasantía', 'Desarrollo de Software', 'Intervención'],
      data: [
        this.projects().filter((p) => p.modalidad === 'Investigación').length,
        this.projects().filter((p) => p.subtipo === 'Pasantía').length,
        this.projects().filter((p) => p.subtipo === 'Proyecto de Desarrollo de Software').length,
        this.projects().filter((p) => p.subtipo === 'Proyecto de Intervención').length,
      ],
    },
  }));

  setSelectedProject(projectId: number): void {
    this.selectedProjectId.set(projectId);
  }

  getProject(projectId: number): ProyectoComite | undefined {
    return this.projects().find((p) => p.id === projectId);
  }

  getPhaseLabel(phase: ComiteFaseProyecto): string {
    const labels: Record<ComiteFaseProyecto, string> = {
      [ComiteFaseProyecto.Inscripcion]: 'Inscripción',
      [ComiteFaseProyecto.Aprobacion]: 'Aprobación',
      [ComiteFaseProyecto.Desarrollo]: 'Desarrollo',
      [ComiteFaseProyecto.Culminacion]: 'Culminación',
      [ComiteFaseProyecto.Evaluacion]: 'Evaluación',
      [ComiteFaseProyecto.Finalizado]: 'Finalizado',
    };
    return labels[phase];
  }

  getStatusLabel(status: ComiteEstadoProyecto): string {
    const labels: Record<ComiteEstadoProyecto, string> = {
      [ComiteEstadoProyecto.PendienteRevision]: 'Pendiente revisión',
      [ComiteEstadoProyecto.EnCurso]: 'En curso',
      [ComiteEstadoProyecto.PendienteJurados]: 'Pendiente jurados',
      [ComiteEstadoProyecto.PendienteProgramacion]: 'Pendiente programación',
      [ComiteEstadoProyecto.PendienteActaFinal]: 'Pendiente acta final',
      [ComiteEstadoProyecto.ConProrroga]: 'Con prórroga',
      [ComiteEstadoProyecto.Finalizado]: 'Finalizado',
      [ComiteEstadoProyecto.Cancelado]: 'Cancelado',
      [ComiteEstadoProyecto.Reprobado]: 'Reprobado',
    };
    return labels[status];
  }

  getNotificationIcon(type: TipoNotificacionComite): string {
    const icons: Record<TipoNotificacionComite, string> = {
      nuevo_proyecto: 'note_add',
      documentos_inscripcion: 'folder_open',
      refrendo_asesor: 'fact_check',
      revision_jurado: 'rate_review',
      aval_sustentacion: 'verified',
      calificacion_jurado: 'grading',
      informe_trimestral: 'article',
      documentos_culminacion: 'inventory_2',
      fecha_vencida: 'warning',
      prorroga: 'event_repeat',
    };
    return icons[type];
  }

  markAllNotificationsRead(): void {
    this.notifications.update((items) => items.map((item) => ({ ...item, leida: true })));
  }

  markNotificationRead(notificationId: number): void {
    this.notifications.update((items) => items.map((item) => (item.id === notificationId ? { ...item, leida: true } : item)));
  }

  approveInscription(projectId: number, observation: string, juries: JuradoAsignado[]): void {
    this.updateProject(projectId, (project) => {
      project.inscripcion.observaciones = observation;
      project.inscripcion.juradosRevisores = juries;
      project.estado = ComiteEstadoProyecto.EnCurso;
      project.faseActual = ComiteFaseProyecto.Aprobacion;
      project.acuerdos.unshift({ id: Date.now(), numero: `CC-2026-${Math.floor(Math.random() * 900 + 100)}`, fecha: nowIso(), tipo: 'Aprobación de inscripción', descripcion: 'Se aprobaron documentos y se asignaron jurados revisores.' });
      project.historial.unshift(this.createHistory('Aprobó inscripción', observation || 'Sin observaciones adicionales.'));
      return project;
    });
  }

  requestCorrections(projectId: number, phase: string, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.estado = ComiteEstadoProyecto.PendienteRevision;
      project.historial.unshift(this.createHistory(`Solicitó correcciones en ${phase}`, observation));
      return project;
    });
  }

  emitApprovalAgreement(projectId: number): void {
    this.updateProject(projectId, (project) => {
      project.acuerdos.unshift({ id: Date.now(), numero: `CC-2026-${Math.floor(Math.random() * 900 + 100)}`, fecha: nowIso(), tipo: 'Acuerdo de aprobación del proyecto', descripcion: 'Se emitió acuerdo formal de aprobación.' });
      project.faseActual = ComiteFaseProyecto.Desarrollo;
      project.estado = ComiteEstadoProyecto.EnCurso;
      project.historial.unshift(this.createHistory('Emitió acuerdo de aprobación', 'Proyecto habilitado para desarrollo.'));
      return project;
    });
  }

  registerExtension(projectId: number, newDate: string, reason: string): void {
    this.updateProject(projectId, (project) => {
      project.desarrollo.prorrogas.unshift({ id: Date.now(), fecha: nowIso(), nuevaFecha: newDate, motivo: reason });
      project.fechaLimite = newDate;
      project.estado = ComiteEstadoProyecto.ConProrroga;
      project.historial.unshift(this.createHistory('Registró prórroga', `${reason} Nueva fecha: ${newDate}`));
      return project;
    });
  }

  approveCulmination(projectId: number, observation: string, juries: JuradoAsignado[]): void {
    this.updateProject(projectId, (project) => {
      project.culminacion.juradosEvaluadores = juries;
      project.faseActual = ComiteFaseProyecto.Evaluacion;
      project.estado = ComiteEstadoProyecto.PendienteProgramacion;
      project.evaluacion.avalesPendientes = true;
      project.historial.unshift(this.createHistory('Aprobó culminación y asignó jurados evaluadores', observation || 'Sin observaciones.'));
      return project;
    });
  }

  scheduleDefense(projectId: number, privateDate: string, publicDate: string): void {
    this.updateProject(projectId, (project) => {
      project.evaluacion.sustentacionPrivada = privateDate;
      project.evaluacion.socializacionPublica = publicDate;
      project.estado = ComiteEstadoProyecto.EnCurso;
      project.historial.unshift(this.createHistory('Programó sustentación', `Privada: ${privateDate} / Pública: ${publicDate}`));
      return project;
    });
  }

  generateFinalAct(projectId: number): void {
    this.updateProject(projectId, (project) => {
      const average = project.evaluacion.calificaciones.reduce((sum, item) => sum + item.nota, 0) / Math.max(project.evaluacion.calificaciones.length, 1);
      project.evaluacion.notaFinal = Math.round(average * 100) / 100;
      project.evaluacion.conceptoFinal = average >= 95 ? 'Meritorio' : average >= 60 ? 'Aprobado' : 'Reprobado';
      project.evaluacion.actaFinalGenerada = true;
      project.estado = ComiteEstadoProyecto.Finalizado;
      project.faseActual = ComiteFaseProyecto.Finalizado;
      project.historial.unshift(this.createHistory('Generó acta final', `Nota final: ${project.evaluacion.notaFinal}`));
      return project;
    });
  }

  createProject(input: { estudiantes: string[]; modalidad: string; subtipo: string; nombre: string; asesor: string; periodo: string; fechaInicio: string; duracionMeses: number; grupoInvestigacion?: string }): void {
    const fechaLimite = new Date(input.fechaInicio);
    fechaLimite.setMonth(fechaLimite.getMonth() + input.duracionMeses);
    this.projects.update((items) => [
      {
        id: Date.now(),
        nombre: input.nombre,
        estudiantes: input.estudiantes,
        asesor: input.asesor,
        modalidad: input.modalidad,
        subtipo: input.subtipo,
        periodo: input.periodo,
        faseActual: ComiteFaseProyecto.Inscripcion,
        estado: ComiteEstadoProyecto.PendienteRevision,
        fechaInicio: input.fechaInicio,
        fechaLimite: fechaLimite.toISOString().slice(0, 10),
        ultimaActividad: nowIso(),
        grupoInvestigacion: input.grupoInvestigacion,
        infoGeneral: { comentarioEstudiante: '', observacionesComite: '' },
        inscripcion: { documentos: [], fechaLimite: fechaLimite.toISOString().slice(0, 10), observaciones: '', juradosRevisores: [] },
        aprobacion: { iteraciones: [], diasRestantes: this.defaultDeadlines().revisionJuradosInscripcion },
        desarrollo: { informes: [], prorrogas: [] },
        culminacion: { documentos: [], cartaAsesor: false, avalEntidad: false, juradosEvaluadores: [] },
        evaluacion: { asistentesSocializacion: 0, calificaciones: [], actaFinalGenerada: false, avalesPendientes: false },
        acuerdos: [],
        historial: [this.createHistory('Registró nuevo proyecto', 'Creación manual desde comité')],
      },
      ...items,
    ]);
  }

  replaceTemplate(templateId: number): void {
    this.templates.update((items) => items.map((item) => (item.id === templateId ? { ...item, ultimaActualizacion: nowIso().slice(0, 10) } : item)));
  }

  deleteTemplate(templateId: number): void {
    this.templates.update((items) => items.filter((item) => item.id !== templateId));
  }

  addTemplate(item: Omit<PlantillaComite, 'id' | 'ultimaActualizacion'>): void {
    this.templates.update((items) => [{ id: Date.now(), ...item, ultimaActualizacion: nowIso().slice(0, 10) }, ...items]);
  }

  createUser(input: { nombre: string; correo: string; rol: string; contrasena: string }): void {
    const [nombre, apellido] = input.nombre.split(' ', 2);
    const payload = {
      nombre: nombre || input.nombre,
      apellido: apellido || '',
      correo: input.correo,
      password: input.contrasena,
      roles: input.rol === 'Estudiante' ? [] : [input.rol === 'Comité Curricular' ? 'COMITE' : input.rol === 'Asesor/Director' ? 'DOCENTE' : 'JURADO'],
      codigo_docente: input.rol === 'Estudiante' ? '' : `DOC-${Date.now()}`,
      codigo_estudiante: input.rol === 'Estudiante' ? `EST-${Date.now()}` : '',
      programa: input.rol === 'Estudiante' ? 'Ingeniería de Sistemas' : '',
    };
    const endpoint = input.rol === 'Estudiante' ? 'estudiantes/' : 'docentes/';
    this.http.post<{ datos: unknown }>(`${this.apiUrl}/usuarios/${endpoint}`, payload).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => console.error('Error creando usuario:', err),
    });
  }

  loadUsers(): void {
    this.http.get<{ datos: UsuarioComiteApi[] }>(`${this.apiUrl}/usuarios/`).subscribe({
      next: (response) => {
        const usuariosAPI = (response.datos || []).map((u) => ({
          id: u.id,
          nombre: `${u.nombre} ${u.apellido}`.trim(),
          correo: u.correo,
          rol: u.roles.includes('COMITE')
            ? 'Comité Curricular'
            : u.roles.includes('DOCENTE')
            ? 'Asesor/Director'
            : u.roles.includes('JURADO')
            ? 'Jurado Evaluador'
            : 'Estudiante',
          estado: u.activo ? 'Activo' : 'Inactivo',
          fechaRegistro: u.fecha_registro,
        }));
        this.users.set(usuariosAPI as UsuarioSistema[]);
      },
      error: (err) => console.error('Error cargando usuarios:', err),
    });
  }

  toggleUserStatus(userId: number): void {
    this.http.patch<{ datos: unknown }>(`${this.apiUrl}/usuarios/${userId}/desactivar/`, {}).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => console.error('Error toggling user status:', err),
    });
  }

  updateRolePermissions(role: string, permissions: string[]): void {
    this.roles.update((items) => items.map((item) => (item.rol === role ? { ...item, permisos: permissions } : item)));
  }

  createPeriod(input: { nombre: string; inicio: string; fin: string }): void {
    this.periods.update((items) => [...items.map((p) => ({ ...p, estado: 'Cerrado' as const })), { id: Date.now(), nombre: input.nombre, inicio: input.inicio, fin: input.fin, estado: 'Activo' }]);
    this.perfilSignal.update((perfil) => ({ ...perfil, periodoActivo: input.nombre }));
  }

  closePeriod(periodId: number): void {
    this.periods.update((items) => items.map((item) => (item.id === periodId ? { ...item, estado: 'Cerrado' } : item)));
  }

  saveDefaultDeadlines(value: PlazosDefecto): void {
    this.defaultDeadlines.set({ ...value });
  }

  saveGeneralParameters(value: ParametrosGenerales): void {
    this.generalParams.set({ ...value });
  }

  formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('es-CO', options ?? { dateStyle: 'medium' }).format(new Date(value));
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }

  private daysUntil(dateValue: string): number {
    const target = new Date(dateValue).getTime();
    return Math.ceil((target - new Date(NOW).getTime()) / (1000 * 60 * 60 * 24));
  }

  private updateProject(projectId: number, updater: (project: ProyectoComite) => ProyectoComite): void {
    this.projects.update((items) => items.map((item) => (item.id === projectId ? updater(structuredClone(item)) : item)));
  }

  private createHistory(action: string, detail: string): HistorialComiteProyecto {
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      fechaHora: nowIso(),
      accion: action,
      detalle: detail || 'Sin observaciones adicionales.',
      usuario: this.perfilSignal().nombre,
    };
  }
}
