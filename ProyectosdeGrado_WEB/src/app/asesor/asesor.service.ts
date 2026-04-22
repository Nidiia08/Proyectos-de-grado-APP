import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth.service';

export enum EstadoProyectoAsesor {
  EnCurso = 'en_curso',
  PendienteAccionAsesor = 'pendiente_accion_asesor',
  ConObservaciones = 'con_observaciones',
  Finalizado = 'finalizado',
}

export type FaseProyecto =
  | 'inscripcion'
  | 'aprobacion'
  | 'desarrollo'
  | 'culminacion'
  | 'evaluacion';

export type TipoAlertaAsesor =
  | 'revision_documentos'
  | 'fecha_limite'
  | 'informe_trimestral';

export type TipoNotificacionAsesor =
  | 'documentos_inscripcion'
  | 'ajustes_jurados'
  | 'informe_trimestral'
  | 'documentos_culminacion'
  | 'acuerdo_aprobacion'
  | 'asignacion_jurados'
  | 'fecha_limite'
  | 'observaciones_jurado';

export type CategoriaPlantilla =
  | 'Inscripción'
  | 'Aprobación'
  | 'Desarrollo'
  | 'Culminación'
  | 'Sustentación y Evaluación';

export type CategoriaRevision =
  | 'inscripcion'
  | 'ajustes_aprobacion'
  | 'informes'
  | 'culminacion';

export interface DocenteAsesor {
  id: number;
  nombre: string;
  rol: string;
  fechaActual: string;
}

export interface AlertaAsesor {
  id: number;
  projectId: number;
  tipo: TipoAlertaAsesor;
  estudiante: string;
  proyecto: string;
  fase: string;
  accionRequerida: string;
  diasRestantes?: number;
  prioridad: number;
  destino: 'proyectos' | 'revisiones';
}

export interface PlantillaAsesor {
  id: number;
  nombre: string;
  categoria: CategoriaPlantilla;
  modalidadAplica: string;
  descripcion: string;
}

export interface NotificacionAsesor {
  id: number;
  tipo: TipoNotificacionAsesor;
  titulo: string;
  descripcion: string;
  estudiante: string;
  proyecto: string;
  projectId: number;
  fechaHora: string;
  leida: boolean;
}

export interface DocumentoProyecto {
  id: number;
  nombre: string;
  estado: string;
  fecha: string;
}

export interface IteracionAprobacion {
  id: number;
  iteracion: number;
  observacionesJurados: string[];
  documentoAjustes: string;
  estado: string;
  diasHabilesRestantes: number;
  observacionAsesor?: string;
  fecha: string;
}

export interface InformeTrimestral {
  id: number;
  numero: number;
  periodo: string;
  archivo: string;
  comentarioEstudiante: string;
  estado: string;
  fechaEntrega: string;
  observacionAsesor?: string;
}

export interface HistorialProyecto {
  id: number;
  fechaHora: string;
  accion: string;
  detalle: string;
}

export interface ProyectoAsesor {
  id: number;
  nombre: string;
  estudiantes: string[];
  modalidad: string;
  subtipo: string;
  faseActual: FaseProyecto;
  estado: EstadoProyectoAsesor;
  progreso: number;
  fechaLimite?: string;
  comentarioInscripcion: string;
  documentosInscripcion: DocumentoProyecto[];
  estadoInscripcion: string;
  iteracionesAprobacion: IteracionAprobacion[];
  informesTrimestrales: InformeTrimestral[];
  documentosCulminacion: DocumentoProyecto[];
  enlaceNube?: string;
  estadoEvaluacion: string;
  calificacionFinal?: string;
  historial: HistorialProyecto[];
}

const TODAY = new Date('2026-04-12T09:00:00-05:00');

function todayIso(): string {
  return TODAY.toISOString();
}

function createProjects(): ProyectoAsesor[] {
  return [
    {
      id: 101,
      nombre: 'Sistema inteligente para gestión de semilleros',
      estudiantes: ['Laura Benavides', 'Mateo Guerrero'],
      modalidad: 'Investigación',
      subtipo: 'Grupo de investigación',
      faseActual: 'inscripcion',
      estado: EstadoProyectoAsesor.PendienteAccionAsesor,
      progreso: 18,
      fechaLimite: '2026-04-16',
      comentarioInscripcion: 'Profesor, adjuntamos la propuesta y el aval del grupo para su refrendo.',
      documentosInscripcion: [
        { id: 1, nombre: 'Propuesta de trabajo de grado.pdf', estado: 'En revisión del asesor', fecha: '2026-04-10' },
        { id: 2, nombre: 'Aval director y grupo de investigación.pdf', estado: 'Pendiente de refrendo', fecha: '2026-04-10' },
      ],
      estadoInscripcion: 'Pendiente refrendo del asesor',
      iteracionesAprobacion: [],
      informesTrimestrales: [],
      documentosCulminacion: [],
      estadoEvaluacion: 'No inicia',
      historial: [],
    },
    {
      id: 102,
      nombre: 'Plataforma web para seguimiento de egresados',
      estudiantes: ['Camila Rosero'],
      modalidad: 'Interacción Social',
      subtipo: 'Proyecto de Desarrollo de Software',
      faseActual: 'aprobacion',
      estado: EstadoProyectoAsesor.ConObservaciones,
      progreso: 46,
      fechaLimite: '2026-04-15',
      comentarioInscripcion: 'Propuesta aprobada en comité.',
      documentosInscripcion: [
        { id: 3, nombre: 'Propuesta aprobada.pdf', estado: 'Refrendada', fecha: '2026-02-11' },
      ],
      estadoInscripcion: 'Aprobada',
      iteracionesAprobacion: [
        {
          id: 1,
          iteracion: 1,
          observacionesJurados: [
            'Ajustar alcance de la arquitectura propuesta.',
            'Precisar cronograma de entregables.',
          ],
          documentoAjustes: 'ajustes_iteracion_1.pdf',
          estado: 'Pendiente de refrendo del asesor',
          diasHabilesRestantes: 3,
          fecha: '2026-04-09',
        },
      ],
      informesTrimestrales: [],
      documentosCulminacion: [],
      estadoEvaluacion: 'No inicia',
      historial: [],
    },
    {
      id: 103,
      nombre: 'Modelo de intervención TIC para asociaciones rurales',
      estudiantes: ['Sebastián Enríquez'],
      modalidad: 'Interacción Social',
      subtipo: 'Proyecto de Intervención',
      faseActual: 'desarrollo',
      estado: EstadoProyectoAsesor.PendienteAccionAsesor,
      progreso: 64,
      fechaLimite: '2026-04-18',
      comentarioInscripcion: 'Proyecto en ejecución con acompañamiento comunitario.',
      documentosInscripcion: [
        { id: 4, nombre: 'Acta de inscripción.pdf', estado: 'Aprobada', fecha: '2025-12-02' },
      ],
      estadoInscripcion: 'Aprobada',
      iteracionesAprobacion: [],
      informesTrimestrales: [
        {
          id: 1,
          numero: 2,
          periodo: 'Enero - Marzo 2026',
          archivo: 'informe_trimestral_2.pdf',
          comentarioEstudiante: 'Se anexan avances y resultados de los talleres comunitarios.',
          estado: 'Pendiente de revisión',
          fechaEntrega: '2026-04-08',
        },
      ],
      documentosCulminacion: [],
      estadoEvaluacion: 'No inicia',
      historial: [],
    },
    {
      id: 104,
      nombre: 'Pasantía de automatización de reportes empresariales',
      estudiantes: ['Valentina Muñoz'],
      modalidad: 'Interacción Social',
      subtipo: 'Pasantía',
      faseActual: 'culminacion',
      estado: EstadoProyectoAsesor.PendienteAccionAsesor,
      progreso: 88,
      fechaLimite: '2026-04-14',
      comentarioInscripcion: 'Proyecto próximo a cierre.',
      documentosInscripcion: [
        { id: 5, nombre: 'Propuesta de pasantía.pdf', estado: 'Refrendada', fecha: '2025-09-18' },
      ],
      estadoInscripcion: 'Aprobada',
      iteracionesAprobacion: [],
      informesTrimestrales: [
        {
          id: 2,
          numero: 3,
          periodo: 'Octubre - Diciembre 2025',
          archivo: 'informe_trimestral_3.pdf',
          comentarioEstudiante: 'Sin novedades.',
          estado: 'Revisado',
          fechaEntrega: '2026-01-10',
          observacionAsesor: 'Informe recibido y conforme.',
        },
      ],
      documentosCulminacion: [
        { id: 6, nombre: 'Informe final de pasantía.pdf', estado: 'Pendiente carta de cumplimiento', fecha: '2026-04-11' },
        { id: 7, nombre: 'Aval entidad receptora.pdf', estado: 'Recibido', fecha: '2026-04-11' },
      ],
      enlaceNube: 'https://drive.google.com/mock-carpeta-proyecto-104',
      estadoEvaluacion: 'Pendiente acta final',
      historial: [],
    },
    {
      id: 105,
      nombre: 'Analítica de datos para permanencia estudiantil',
      estudiantes: ['Juliana Ortiz', 'Kevin Realpe'],
      modalidad: 'Investigación',
      subtipo: 'Trabajo finalizado',
      faseActual: 'evaluacion',
      estado: EstadoProyectoAsesor.Finalizado,
      progreso: 100,
      comentarioInscripcion: 'Cierre de proceso.',
      documentosInscripcion: [
        { id: 8, nombre: 'Propuesta aprobada.pdf', estado: 'Aprobada', fecha: '2025-05-04' },
      ],
      estadoInscripcion: 'Aprobada',
      iteracionesAprobacion: [],
      informesTrimestrales: [],
      documentosCulminacion: [
        { id: 9, nombre: 'Documento final.pdf', estado: 'Aprobado', fecha: '2026-02-15' },
      ],
      estadoEvaluacion: 'Evaluación finalizada',
      calificacionFinal: '4.8 / 5.0',
      historial: [],
    },
  ];
}

function createNotifications(): NotificacionAsesor[] {
  return [
    {
      id: 1,
      tipo: 'documentos_inscripcion',
      titulo: 'Documentos de inscripción recibidos',
      descripcion: 'El estudiante cargó la propuesta y el aval del grupo para revisión.',
      estudiante: 'Laura Benavides',
      proyecto: 'Sistema inteligente para gestión de semilleros',
      projectId: 101,
      fechaHora: '2026-04-10T08:45:00-05:00',
      leida: false,
    },
    {
      id: 2,
      tipo: 'ajustes_jurados',
      titulo: 'Ajustes listos para refrendo',
      descripcion: 'Se cargó el documento de ajustes tras observaciones de jurados.',
      estudiante: 'Camila Rosero',
      proyecto: 'Plataforma web para seguimiento de egresados',
      projectId: 102,
      fechaHora: '2026-04-09T14:30:00-05:00',
      leida: false,
    },
    {
      id: 3,
      tipo: 'informe_trimestral',
      titulo: 'Informe trimestral enviado',
      descripcion: 'Hay un nuevo informe trimestral pendiente de revisión.',
      estudiante: 'Sebastián Enríquez',
      proyecto: 'Modelo de intervención TIC para asociaciones rurales',
      projectId: 103,
      fechaHora: '2026-04-08T16:10:00-05:00',
      leida: false,
    },
    {
      id: 4,
      tipo: 'documentos_culminacion',
      titulo: 'Documentos de culminación disponibles',
      descripcion: 'El estudiante entregó documentos finales y enlace de soporte.',
      estudiante: 'Valentina Muñoz',
      proyecto: 'Pasantía de automatización de reportes empresariales',
      projectId: 104,
      fechaHora: '2026-04-11T11:20:00-05:00',
      leida: true,
    },
    {
      id: 5,
      tipo: 'fecha_limite',
      titulo: 'Fecha límite próxima',
      descripcion: 'Faltan menos de 5 días hábiles para refrendar ajustes.',
      estudiante: 'Camila Rosero',
      proyecto: 'Plataforma web para seguimiento de egresados',
      projectId: 102,
      fechaHora: '2026-04-12T07:00:00-05:00',
      leida: false,
    },
    {
      id: 6,
      tipo: 'asignacion_jurados',
      titulo: 'Jurados asignados',
      descripcion: 'El Comité Curricular asignó jurados evaluadores al proyecto.',
      estudiante: 'Juliana Ortiz',
      proyecto: 'Analítica de datos para permanencia estudiantil',
      projectId: 105,
      fechaHora: '2026-02-01T09:00:00-05:00',
      leida: true,
    },
  ];
}

function createTemplates(): PlantillaAsesor[] {
  return [
    {
      id: 1,
      nombre: 'Formato de presentación de la Propuesta de Trabajo de Grado',
      categoria: 'Inscripción',
      modalidadAplica: 'Todas las modalidades',
      descripcion: 'Documento base para formalizar la propuesta ante el comité.',
    },
    {
      id: 2,
      nombre: 'Formato de Aval del director y del grupo de investigación',
      categoria: 'Inscripción',
      modalidadAplica: 'Solo Investigación',
      descripcion: 'Aval requerido cuando el trabajo se registra en investigación.',
    },
    {
      id: 3,
      nombre: 'Aval de jurados revisores',
      categoria: 'Aprobación',
      modalidadAplica: 'Todas las modalidades',
      descripcion: 'Formato de concepto emitido por jurados revisores.',
    },
    {
      id: 4,
      nombre: 'Plantilla de informe trimestral',
      categoria: 'Desarrollo',
      modalidadAplica: 'Todas las modalidades',
      descripcion: 'Plantilla institucional para reportar avances trimestrales.',
    },
    {
      id: 5,
      nombre: 'Carta del director/asesor confirmando cumplimiento de objetivos',
      categoria: 'Culminación',
      modalidadAplica: 'Todas las modalidades',
      descripcion: 'Carta de cierre emitida por el docente asesor.',
    },
    {
      id: 6,
      nombre: 'Modelo de aval de entidad receptora',
      categoria: 'Culminación',
      modalidadAplica: 'Solo Pasantía',
      descripcion: 'Formato de aval emitido por la entidad receptora.',
    },
    {
      id: 7,
      nombre: 'Aval de Sustentación y Socialización',
      categoria: 'Sustentación y Evaluación',
      modalidadAplica: 'Todas las modalidades',
      descripcion: 'Documento previo a la sustentación pública.',
    },
    {
      id: 8,
      nombre: 'Acta de evaluación final',
      categoria: 'Sustentación y Evaluación',
      modalidadAplica: 'Todas las modalidades',
      descripcion: 'Acta oficial para registrar la nota final.',
    },
  ];
}

@Injectable({
  providedIn: 'root',
})
export class AsesorService {
  private readonly auth = inject(AuthService);

  private readonly docente = signal<DocenteAsesor>({
    id: 1,
    nombre: 'Dra. María Fernanda Rosero',
    rol: 'Docente Director / Asesor',
    fechaActual: todayIso(),
  });

  private readonly proyectos = signal<ProyectoAsesor[]>(createProjects());
  private readonly notificaciones = signal<NotificacionAsesor[]>(createNotifications());
  private readonly plantillas = signal<PlantillaAsesor[]>(createTemplates());
  readonly selectedProjectId = signal<number | null>(101);

  readonly docenteActual = computed(() => {
    const role = this.auth.userRole();
    const base = this.docente();
    if (role === 'professor') {
      return base;
    }
    return { ...base, nombre: 'Docente de prueba' };
  });

  readonly proyectosAsignados = computed(() => this.proyectos());
  readonly plantillasDisponibles = computed(() => this.plantillas());
  readonly notificacionesOrdenadas = computed(() =>
    [...this.notificaciones()].sort((a, b) => +new Date(b.fechaHora) - +new Date(a.fechaHora)),
  );
  readonly noLeidasCount = computed(() => this.notificaciones().filter((item) => !item.leida).length);

  readonly dashboardMetrics = computed(() => {
    const data = this.proyectos();
    return {
      total: data.length,
      activos: data.filter((p) => p.estado !== EstadoProyectoAsesor.Finalizado).length,
      pendientesAsesor: data.filter((p) => p.estado === EstadoProyectoAsesor.PendienteAccionAsesor).length,
      finalizados: data.filter((p) => p.estado === EstadoProyectoAsesor.Finalizado).length,
    };
  });

  readonly alertas = computed<AlertaAsesor[]>(() => {
    const alerts: AlertaAsesor[] = [];

    for (const project of this.proyectos()) {
      if (project.documentosInscripcion.some((doc) => doc.estado.toLowerCase().includes('revisión') || doc.estado.toLowerCase().includes('pendiente'))) {
        alerts.push({
          id: Number(`${project.id}1`),
          projectId: project.id,
          tipo: 'revision_documentos',
          estudiante: project.estudiantes.join(', '),
          proyecto: project.nombre,
          fase: this.getPhaseLabel(project.faseActual),
          accionRequerida: 'Revisar y refrendar documentos enviados por el estudiante',
          prioridad: 1,
          destino: 'revisiones',
        });
      }

      const pendingAdjustment = project.iteracionesAprobacion.find((iteration) =>
        iteration.estado.toLowerCase().includes('pendiente'),
      );
      if (pendingAdjustment) {
        alerts.push({
          id: Number(`${project.id}2`),
          projectId: project.id,
          tipo: 'fecha_limite',
          estudiante: project.estudiantes.join(', '),
          proyecto: project.nombre,
          fase: this.getPhaseLabel(project.faseActual),
          accionRequerida: `Refrendar ajustes de la iteración ${pendingAdjustment.iteracion}`,
          diasRestantes: pendingAdjustment.diasHabilesRestantes,
          prioridad: 2,
          destino: 'revisiones',
        });
      }

      const pendingReport = project.informesTrimestrales.find((report) => report.estado === 'Pendiente de revisión');
      if (pendingReport) {
        alerts.push({
          id: Number(`${project.id}3`),
          projectId: project.id,
          tipo: 'informe_trimestral',
          estudiante: project.estudiantes.join(', '),
          proyecto: project.nombre,
          fase: this.getPhaseLabel(project.faseActual),
          accionRequerida: `Revisar informe trimestral ${pendingReport.numero}`,
          prioridad: 3,
          destino: 'revisiones',
        });
      }
    }

    return alerts.sort((a, b) => a.prioridad - b.prioridad);
  });

  readonly selectedProject = computed(() => {
    const currentId = this.selectedProjectId();
    const current = this.proyectos().find((project) => project.id === currentId);
    return current ?? this.proyectos()[0] ?? null;
  });

  readonly reviewBuckets = computed(() => {
    const projects = this.proyectos();
    return {
      inscripcion: projects.filter((project) =>
        project.faseActual === 'inscripcion' &&
        project.documentosInscripcion.some((doc) => doc.estado.toLowerCase().includes('pendiente') || doc.estado.toLowerCase().includes('revisión')),
      ),
      ajustesAprobacion: projects.filter((project) =>
        project.iteracionesAprobacion.some((iteration) => iteration.estado.toLowerCase().includes('pendiente')),
      ),
      informes: projects.filter((project) =>
        project.informesTrimestrales.some((report) => report.estado === 'Pendiente de revisión'),
      ),
      culminacion: projects.filter((project) =>
        project.documentosCulminacion.some((doc) => doc.estado.toLowerCase().includes('pendiente')),
      ),
    };
  });

  setSelectedProject(projectId: number): void {
    this.selectedProjectId.set(projectId);
  }

  getProjectById(projectId: number): ProyectoAsesor | undefined {
    return this.proyectos().find((project) => project.id === projectId);
  }

  getPhaseLabel(phase: FaseProyecto): string {
    const labels: Record<FaseProyecto, string> = {
      inscripcion: 'Inscripción',
      aprobacion: 'Aprobación',
      desarrollo: 'Desarrollo',
      culminacion: 'Culminación',
      evaluacion: 'Evaluación',
    };
    return labels[phase];
  }

  getEstadoLabel(status: EstadoProyectoAsesor): string {
    const labels: Record<EstadoProyectoAsesor, string> = {
      [EstadoProyectoAsesor.EnCurso]: 'En curso',
      [EstadoProyectoAsesor.PendienteAccionAsesor]: 'Pendiente acción asesor',
      [EstadoProyectoAsesor.ConObservaciones]: 'Con observaciones',
      [EstadoProyectoAsesor.Finalizado]: 'Finalizado',
    };
    return labels[status];
  }

  getNotificationIcon(type: TipoNotificacionAsesor): string {
    const icons: Record<TipoNotificacionAsesor, string> = {
      documentos_inscripcion: 'description',
      ajustes_jurados: 'fact_check',
      informe_trimestral: 'article',
      documentos_culminacion: 'folder_open',
      acuerdo_aprobacion: 'task_alt',
      asignacion_jurados: 'groups',
      fecha_limite: 'schedule',
      observaciones_jurado: 'rate_review',
    };
    return icons[type];
  }

  markAllNotificationsRead(): void {
    this.notificaciones.update((items) => items.map((item) => ({ ...item, leida: true })));
  }

  markNotificationRead(notificationId: number): void {
    this.notificaciones.update((items) =>
      items.map((item) => (item.id === notificationId ? { ...item, leida: true } : item)),
    );
  }

  refrendarPropuesta(projectId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.documentosInscripcion = project.documentosInscripcion.map((doc) => ({
        ...doc,
        estado: 'Refrendada por el asesor',
      }));
      project.estadoInscripcion = 'Refrendada y enviada al Comité Curricular';
      project.estado = EstadoProyectoAsesor.EnCurso;
      project.historial.unshift(this.createHistory('Refrendo de propuesta', observation || 'Sin observaciones.'));
      return project;
    });
    this.pushNotification(projectId, 'documentos_inscripcion', 'Propuesta refrendada', 'El asesor refrendó la propuesta y notificó al comité.');
  }

  solicitarCorreccionesInscripcion(projectId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.documentosInscripcion = project.documentosInscripcion.map((doc) => ({
        ...doc,
        estado: 'Correcciones solicitadas',
      }));
      project.estado = EstadoProyectoAsesor.ConObservaciones;
      project.historial.unshift(this.createHistory('Correcciones solicitadas en inscripción', observation || 'Se solicitaron ajustes.'));
      return project;
    });
    this.pushNotification(projectId, 'documentos_inscripcion', 'Correcciones solicitadas', 'El asesor solicitó ajustes en los documentos de inscripción.');
  }

  refrendarAjustes(projectId: number, iterationId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.iteracionesAprobacion = project.iteracionesAprobacion.map((iteration) =>
        iteration.id === iterationId
          ? {
              ...iteration,
              estado: 'Refrendado y enviado a jurados',
              observacionAsesor: observation,
            }
          : iteration,
      );
      project.estado = EstadoProyectoAsesor.EnCurso;
      project.historial.unshift(this.createHistory('Ajustes refrendados', observation || 'Ajustes refrendados y enviados a jurados.'));
      return project;
    });
    this.pushNotification(projectId, 'ajustes_jurados', 'Ajustes refrendados', 'Se notificó el refrendo de ajustes al estudiante y a jurados.');
  }

  solicitarCorreccionesAjustes(projectId: number, iterationId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.iteracionesAprobacion = project.iteracionesAprobacion.map((iteration) =>
        iteration.id === iterationId
          ? {
              ...iteration,
              estado: 'Correcciones solicitadas por el asesor',
              observacionAsesor: observation,
            }
          : iteration,
      );
      project.estado = EstadoProyectoAsesor.ConObservaciones;
      project.historial.unshift(this.createHistory('Correcciones solicitadas en aprobación', observation || 'Ajustes devueltos al estudiante.'));
      return project;
    });
    this.pushNotification(projectId, 'ajustes_jurados', 'Correcciones solicitadas', 'Se devolvieron los ajustes al estudiante con observaciones.');
  }

  marcarInformeRevisado(projectId: number, reportId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.informesTrimestrales = project.informesTrimestrales.map((report) =>
        report.id === reportId
          ? {
              ...report,
              estado: 'Revisado',
              observacionAsesor: observation,
            }
          : report,
      );
      project.estado = EstadoProyectoAsesor.EnCurso;
      project.historial.unshift(this.createHistory('Informe trimestral revisado', observation || 'Informe revisado sin observaciones.'));
      return project;
    });
  }

  enviarObservacionesInforme(projectId: number, reportId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.informesTrimestrales = project.informesTrimestrales.map((report) =>
        report.id === reportId
          ? {
              ...report,
              estado: 'Observaciones enviadas',
              observacionAsesor: observation,
            }
          : report,
      );
      project.estado = EstadoProyectoAsesor.ConObservaciones;
      project.historial.unshift(this.createHistory('Observaciones sobre informe trimestral', observation || 'Observaciones enviadas al estudiante.'));
      return project;
    });
    this.pushNotification(projectId, 'informe_trimestral', 'Observaciones al informe trimestral', 'El asesor dejó observaciones sobre el informe trimestral.');
  }

  emitirCartaCumplimiento(projectId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      const exists = project.documentosCulminacion.some((doc) => doc.nombre.includes('Carta de cumplimiento'));
      if (!exists) {
        project.documentosCulminacion = [
          {
            id: Date.now(),
            nombre: 'Carta de cumplimiento generada por el asesor.pdf',
            estado: 'Emitida',
            fecha: '2026-04-12',
          },
          ...project.documentosCulminacion,
        ];
      }
      project.estado = EstadoProyectoAsesor.EnCurso;
      project.historial.unshift(this.createHistory('Carta de cumplimiento emitida', observation || 'Carta emitida por el asesor.'));
      return project;
    });
    this.pushNotification(projectId, 'documentos_culminacion', 'Carta de cumplimiento emitida', 'La carta de cumplimiento quedó registrada en el sistema.');
  }

  addProjectObservation(projectId: number, phase: string, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.historial.unshift(this.createHistory(`Observación registrada en ${phase}`, observation || 'Sin observaciones.'));
      return project;
    });
  }

  formatDate(dateValue: string, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('es-CO', options ?? { dateStyle: 'medium' }).format(new Date(dateValue));
  }

  formatDateTime(dateValue: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateValue));
  }

  private updateProject(projectId: number, updater: (project: ProyectoAsesor) => ProyectoAsesor): void {
    this.proyectos.update((projects) =>
      projects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }
        return updater(structuredClone(project));
      }),
    );
  }

  private createHistory(action: string, detail: string): HistorialProyecto {
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      fechaHora: todayIso(),
      accion: action,
      detalle: detail,
    };
  }

  private pushNotification(
    projectId: number,
    type: TipoNotificacionAsesor,
    title: string,
    description: string,
  ): void {
    const project = this.getProjectById(projectId);
    if (!project) {
      return;
    }

    this.notificaciones.update((items) => [
      {
        id: Date.now(),
        tipo: type,
        titulo: title,
        descripcion: description,
        estudiante: project.estudiantes.join(', '),
        proyecto: project.nombre,
        projectId,
        fechaHora: todayIso(),
        leida: false,
      },
      ...items,
    ]);
  }
}
