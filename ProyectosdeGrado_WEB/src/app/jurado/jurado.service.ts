import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth.service';

export enum RolJuradoProyecto {
  Revisor = 'revisor',
  Evaluador = 'evaluador',
  Ambos = 'ambos',
}

export enum EstadoJuradoProyecto {
  PendienteRevision = 'pendiente_revision',
  RevisadoConObservaciones = 'revisado_con_observaciones',
  Aprobado = 'aprobado',
  AvalEmitido = 'aval_emitido',
  Finalizado = 'finalizado',
}

export type FaseJuradoProyecto = 'aprobacion' | 'evaluacion';

export type TipoNotificacionJurado =
  | 'asignacion'
  | 'propuesta'
  | 'ajustes'
  | 'plazo'
  | 'informe_final'
  | 'sustentacion'
  | 'calificacion_otro_jurado';

export interface JuradoPerfil {
  id: number;
  nombre: string;
  rol: string;
  fechaActual: string;
}

export interface IteracionRevisionJurado {
  id: number;
  numero: number;
  maximo: number;
  archivo: string;
  comentarioEstudiante: string;
  diasHabilesRestantes: number;
  estado: 'pendiente_revision' | 'observaciones_emitidas' | 'aprobada';
  observacionesJurado?: string;
  fechaRespuesta?: string;
}

export interface EvaluacionFinalJurado {
  informePrincipal: string;
  anexos: string[];
  enlaceNube?: string;
  revisionConfirmada: boolean;
  observacionesRevision?: string;
  retroalimentacionPrevia?: string;
  rondaRetroalimentacion: 1 | 2;
  diasAjusteRestantes: number;
  avalEmitido: boolean;
  observacionAval?: string;
  fechaAval?: string;
  sustentacionProgramada?: string;
  calificacionEnviada: boolean;
  observacionesFinales?: string;
  rubric: {
    objetivos: number;
    originalidad: number;
    conclusiones: number;
    organizacion: number;
    sustentacionPrivada: number;
    socializacionPublica: number;
  };
}

export interface HistorialJuradoProyecto {
  id: number;
  fechaHora: string;
  accion: string;
  detalle: string;
}

export interface JuradoProyecto {
  id: number;
  nombre: string;
  estudiantes: string[];
  modalidad: string;
  subtipo: string;
  rolJurado: RolJuradoProyecto;
  faseActual: FaseJuradoProyecto;
  estado: EstadoJuradoProyecto;
  iteraciones: IteracionRevisionJurado[];
  evaluacion: EvaluacionFinalJurado;
  historial: HistorialJuradoProyecto[];
}

export interface AlertaJurado {
  id: number;
  projectId: number;
  estudiante: string;
  proyecto: string;
  accion: string;
  diasRestantes?: number;
  destino: 'projects' | 'reviews';
  prioridad: number;
}

export interface PlantillaJurado {
  id: number;
  nombre: string;
  categoria: string;
  fase: string;
  rolUso: string;
}

export interface NotificacionJurado {
  id: number;
  tipo: TipoNotificacionJurado;
  titulo: string;
  descripcion: string;
  estudiante: string;
  proyecto: string;
  projectId: number;
  comoRol: 'revisor' | 'evaluador';
  fechaHora: string;
  leida: boolean;
}

const NOW = '2026-04-12T10:00:00-05:00';

function nowIso(): string {
  return new Date(NOW).toISOString();
}

function createProjects(): JuradoProyecto[] {
  return [
    {
      id: 201,
      nombre: 'Predicción de deserción estudiantil con analítica educativa',
      estudiantes: ['Daniela Pantoja'],
      modalidad: 'Investigación',
      subtipo: 'Grupo de investigación',
      rolJurado: RolJuradoProyecto.Revisor,
      faseActual: 'aprobacion',
      estado: EstadoJuradoProyecto.PendienteRevision,
      iteraciones: [
        {
          id: 1,
          numero: 1,
          maximo: 3,
          archivo: 'propuesta_investigacion_v1.pdf',
          comentarioEstudiante: 'Se comparte la propuesta inicial para revisión.',
          diasHabilesRestantes: 4,
          estado: 'pendiente_revision',
        },
      ],
      evaluacion: {
        informePrincipal: '',
        anexos: [],
        revisionConfirmada: false,
        rondaRetroalimentacion: 1,
        diasAjusteRestantes: 10,
        avalEmitido: false,
        calificacionEnviada: false,
        rubric: {
          objetivos: 0,
          originalidad: 0,
          conclusiones: 0,
          organizacion: 0,
          sustentacionPrivada: 0,
          socializacionPublica: 0,
        },
      },
      historial: [],
    },
    {
      id: 202,
      nombre: 'Plataforma IoT para monitoreo de cultivos en Nariño',
      estudiantes: ['Juan Felipe Rosales', 'Andrea Coral'],
      modalidad: 'Investigación',
      subtipo: 'Semillero de investigación',
      rolJurado: RolJuradoProyecto.Ambos,
      faseActual: 'aprobacion',
      estado: EstadoJuradoProyecto.RevisadoConObservaciones,
      iteraciones: [
        {
          id: 2,
          numero: 1,
          maximo: 3,
          archivo: 'propuesta_iot_v1.pdf',
          comentarioEstudiante: 'Primera entrega de propuesta.',
          diasHabilesRestantes: 0,
          estado: 'observaciones_emitidas',
          observacionesJurado: 'Ajustar objetivos específicos y detallar cronograma experimental.',
          fechaRespuesta: '2026-04-03T15:30:00-05:00',
        },
        {
          id: 3,
          numero: 2,
          maximo: 3,
          archivo: 'ajustes_iot_v2.pdf',
          comentarioEstudiante: 'Se atienden las observaciones de la primera iteración.',
          diasHabilesRestantes: 2,
          estado: 'pendiente_revision',
        },
      ],
      evaluacion: {
        informePrincipal: 'documento_final_iot.pdf',
        anexos: ['anexo_datos.xlsx'],
        enlaceNube: 'https://drive.google.com/mock-iot-final',
        revisionConfirmada: true,
        observacionesRevision: 'Informe final recibido y en análisis.',
        retroalimentacionPrevia: '',
        rondaRetroalimentacion: 1,
        diasAjusteRestantes: 10,
        avalEmitido: false,
        sustentacionProgramada: '2026-04-18T14:00:00-05:00',
        calificacionEnviada: false,
        rubric: {
          objetivos: 0,
          originalidad: 0,
          conclusiones: 0,
          organizacion: 0,
          sustentacionPrivada: 0,
          socializacionPublica: 0,
        },
      },
      historial: [],
    },
    {
      id: 203,
      nombre: 'Sistema de gestión para prácticas comunitarias',
      estudiantes: ['María José Guerrero'],
      modalidad: 'Interacción Social',
      subtipo: 'Proyecto de Desarrollo de Software',
      rolJurado: RolJuradoProyecto.Evaluador,
      faseActual: 'evaluacion',
      estado: EstadoJuradoProyecto.PendienteRevision,
      iteraciones: [],
      evaluacion: {
        informePrincipal: 'informe_final_sistema_practicas.pdf',
        anexos: ['manual_usuario.pdf', 'video_demo.mp4'],
        enlaceNube: 'https://drive.google.com/mock-practicas',
        revisionConfirmada: false,
        rondaRetroalimentacion: 1,
        diasAjusteRestantes: 10,
        avalEmitido: false,
        sustentacionProgramada: '2026-04-20T09:00:00-05:00',
        calificacionEnviada: false,
        rubric: {
          objetivos: 0,
          originalidad: 0,
          conclusiones: 0,
          organizacion: 0,
          sustentacionPrivada: 0,
          socializacionPublica: 0,
        },
      },
      historial: [],
    },
    {
      id: 204,
      nombre: 'Modelo de intervención digital para asociaciones de mujeres',
      estudiantes: ['Paula Santacruz'],
      modalidad: 'Interacción Social',
      subtipo: 'Proyecto de Intervención',
      rolJurado: RolJuradoProyecto.Evaluador,
      faseActual: 'evaluacion',
      estado: EstadoJuradoProyecto.AvalEmitido,
      iteraciones: [],
      evaluacion: {
        informePrincipal: 'informe_intervencion_final.pdf',
        anexos: ['anexo_fotografico.pdf'],
        enlaceNube: 'https://drive.google.com/mock-intervencion',
        revisionConfirmada: true,
        observacionesRevision: 'Documento revisado y conforme.',
        retroalimentacionPrevia: 'Ajustar redacción de conclusiones antes de sustentar.',
        rondaRetroalimentacion: 2,
        diasAjusteRestantes: 5,
        avalEmitido: true,
        observacionAval: 'Se emite aval para sustentación y socialización.',
        fechaAval: '2026-04-10T11:20:00-05:00',
        sustentacionProgramada: '2026-04-15T16:00:00-05:00',
        calificacionEnviada: false,
        rubric: {
          objetivos: 0,
          originalidad: 0,
          conclusiones: 0,
          organizacion: 0,
          sustentacionPrivada: 0,
          socializacionPublica: 0,
        },
      },
      historial: [],
    },
    {
      id: 205,
      nombre: 'Automatización de reportes para entidad receptora',
      estudiantes: ['Cristian Benavides'],
      modalidad: 'Interacción Social',
      subtipo: 'Pasantía',
      rolJurado: RolJuradoProyecto.Ambos,
      faseActual: 'evaluacion',
      estado: EstadoJuradoProyecto.Finalizado,
      iteraciones: [
        {
          id: 4,
          numero: 1,
          maximo: 2,
          archivo: 'propuesta_pasantia.pdf',
          comentarioEstudiante: 'Propuesta entregada para revisión.',
          diasHabilesRestantes: 0,
          estado: 'aprobada',
          fechaRespuesta: '2025-12-12T10:00:00-05:00',
        },
      ],
      evaluacion: {
        informePrincipal: 'informe_final_pasantia.pdf',
        anexos: ['carta_empresa.pdf'],
        revisionConfirmada: true,
        observacionesRevision: 'Proceso final revisado.',
        retroalimentacionPrevia: '',
        rondaRetroalimentacion: 1,
        diasAjusteRestantes: 10,
        avalEmitido: true,
        observacionAval: 'Aval emitido sin observaciones adicionales.',
        fechaAval: '2026-03-18T09:30:00-05:00',
        sustentacionProgramada: '2026-03-25T08:00:00-05:00',
        calificacionEnviada: true,
        observacionesFinales: 'Trabajo aprobado con observaciones menores.',
        rubric: {
          objetivos: 22,
          originalidad: 8,
          conclusiones: 13,
          organizacion: 9,
          sustentacionPrivada: 26,
          socializacionPublica: 9,
        },
      },
      historial: [],
    },
  ];
}

function createTemplates(): PlantillaJurado[] {
  return [
    {
      id: 1,
      nombre: 'Formato de aval de jurados revisores',
      categoria: 'Aprobación',
      fase: 'Fase de Aprobación',
      rolUso: 'Revisor',
    },
    {
      id: 2,
      nombre: 'Aval de Sustentación y Socialización',
      categoria: 'Evaluación',
      fase: 'Fase de Evaluación',
      rolUso: 'Evaluador',
    },
    {
      id: 3,
      nombre: 'Acta de evaluación final',
      categoria: 'Evaluación',
      fase: 'Fase de Evaluación',
      rolUso: 'Evaluador',
    },
  ];
}

function createNotifications(): NotificacionJurado[] {
  return [
    {
      id: 1,
      tipo: 'asignacion',
      titulo: 'Asignación a nuevo proyecto',
      descripcion: 'El Comité Curricular lo asignó como jurado revisor.',
      estudiante: 'Daniela Pantoja',
      proyecto: 'Predicción de deserción estudiantil con analítica educativa',
      projectId: 201,
      comoRol: 'revisor',
      fechaHora: '2026-04-11T09:00:00-05:00',
      leida: false,
    },
    {
      id: 2,
      tipo: 'ajustes',
      titulo: 'Ajustes del estudiante recibidos',
      descripcion: 'Se recibieron ajustes tras observaciones previas.',
      estudiante: 'Juan Felipe Rosales, Andrea Coral',
      proyecto: 'Plataforma IoT para monitoreo de cultivos en Nariño',
      projectId: 202,
      comoRol: 'revisor',
      fechaHora: '2026-04-10T16:10:00-05:00',
      leida: false,
    },
    {
      id: 3,
      tipo: 'informe_final',
      titulo: 'Informe final cargado',
      descripcion: 'El estudiante subió el informe final para evaluación.',
      estudiante: 'María José Guerrero',
      proyecto: 'Sistema de gestión para prácticas comunitarias',
      projectId: 203,
      comoRol: 'evaluador',
      fechaHora: '2026-04-10T11:40:00-05:00',
      leida: false,
    },
    {
      id: 4,
      tipo: 'sustentacion',
      titulo: 'Sustentación programada',
      descripcion: 'El Comité Curricular programó fecha de sustentación.',
      estudiante: 'Paula Santacruz',
      proyecto: 'Modelo de intervención digital para asociaciones de mujeres',
      projectId: 204,
      comoRol: 'evaluador',
      fechaHora: '2026-04-09T08:30:00-05:00',
      leida: true,
    },
    {
      id: 5,
      tipo: 'plazo',
      titulo: 'Plazo próximo a vencer',
      descripcion: 'Quedan menos de 2 días hábiles para responder.',
      estudiante: 'Juan Felipe Rosales, Andrea Coral',
      proyecto: 'Plataforma IoT para monitoreo de cultivos en Nariño',
      projectId: 202,
      comoRol: 'revisor',
      fechaHora: '2026-04-12T07:10:00-05:00',
      leida: false,
    },
    {
      id: 6,
      tipo: 'calificacion_otro_jurado',
      titulo: 'Otro jurado registró su calificación',
      descripcion: 'Se registró la calificación del otro jurado evaluador.',
      estudiante: 'Cristian Benavides',
      proyecto: 'Automatización de reportes para entidad receptora',
      projectId: 205,
      comoRol: 'evaluador',
      fechaHora: '2026-03-26T18:00:00-05:00',
      leida: true,
    },
  ];
}

@Injectable({
  providedIn: 'root',
})
export class JuradoService {
  private readonly auth = inject(AuthService);

  private readonly jurado = signal<JuradoPerfil>({
    id: 1,
    nombre: 'Dr. Carlos Andrés Velasco',
    rol: 'Jurado Evaluador',
    fechaActual: nowIso(),
  });
  private readonly projects = signal<JuradoProyecto[]>(createProjects());
  private readonly templates = signal<PlantillaJurado[]>(createTemplates());
  private readonly notifications = signal<NotificacionJurado[]>(createNotifications());
  readonly selectedProjectId = signal<number | null>(201);

  readonly perfil = computed(() => {
    const role = this.auth.userRole();
    const base = this.jurado();
    if (role === 'jury') {
      const usuario = this.auth.usuario;
      if (usuario) {
        return { ...base, nombre: `${usuario.nombre} ${usuario.apellido}`.trim() };
      }
      return base;
    }
    return { ...base, nombre: 'Jurado de prueba' };
  });

  readonly proyectos = computed(() => this.projects());
  readonly plantillas = computed(() => this.templates());
  readonly notificaciones = computed(() =>
    [...this.notifications()].sort((a, b) => +new Date(b.fechaHora) - +new Date(a.fechaHora)),
  );
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.leida).length);

  readonly metrics = computed(() => {
    const data = this.projects();
    return {
      total: data.length,
      pendientesRevision: data.filter(
        (project) => project.faseActual === 'aprobacion' && project.estado === EstadoJuradoProyecto.PendienteRevision,
      ).length,
      pendientesEvaluacion: data.filter(
        (project) => project.faseActual === 'evaluacion' && project.estado !== EstadoJuradoProyecto.Finalizado,
      ).length,
      avalesEmitidos: data.filter((project) => project.evaluacion.avalEmitido).length,
    };
  });

  readonly alertas = computed<AlertaJurado[]>(() => {
    const alerts: AlertaJurado[] = [];

    for (const project of this.projects()) {
      const pendingIteration = project.iteraciones.find((iteration) => iteration.estado === 'pendiente_revision');
      if (pendingIteration) {
        alerts.push({
          id: Number(`${project.id}1`),
          projectId: project.id,
          estudiante: project.estudiantes.join(', '),
          proyecto: project.nombre,
          accion: `Revisar ${pendingIteration.numero === 1 ? 'propuesta' : 'ajustes'} de la iteración ${pendingIteration.numero}`,
          diasRestantes: pendingIteration.diasHabilesRestantes,
          destino: 'reviews',
          prioridad: pendingIteration.diasHabilesRestantes <= 2 ? 1 : 2,
        });
      }

      if (project.faseActual === 'evaluacion' && !project.evaluacion.revisionConfirmada) {
        alerts.push({
          id: Number(`${project.id}2`),
          projectId: project.id,
          estudiante: project.estudiantes.join(', '),
          proyecto: project.nombre,
          accion: 'Confirmar recepción y revisión del informe final',
          destino: 'reviews',
          prioridad: 2,
        });
      }

      if (project.evaluacion.sustentacionProgramada) {
        const eventDate = new Date(project.evaluacion.sustentacionProgramada).getTime();
        const diffDays = Math.ceil((eventDate - new Date(NOW).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 5) {
          alerts.push({
            id: Number(`${project.id}3`),
            projectId: project.id,
            estudiante: project.estudiantes.join(', '),
            proyecto: project.nombre,
            accion: `Sustentación programada para ${this.formatDateTime(project.evaluacion.sustentacionProgramada)}`,
            diasRestantes: diffDays,
            destino: 'projects',
            prioridad: 3,
          });
        }
      }
    }

    return alerts.sort((a, b) => a.prioridad - b.prioridad);
  });

  readonly selectedProject = computed(() => {
    const currentId = this.selectedProjectId();
    return this.projects().find((project) => project.id === currentId) ?? this.projects()[0] ?? null;
  });

  readonly reviewBuckets = computed(() => {
    const data = this.projects();
    return {
      propuestas: data.filter((project) => project.iteraciones.some((item) => item.estado === 'pendiente_revision')),
      informes: data.filter(
        (project) => project.rolJurado !== RolJuradoProyecto.Revisor && !project.evaluacion.revisionConfirmada,
      ),
      avales: data.filter(
        (project) =>
          project.rolJurado !== RolJuradoProyecto.Revisor &&
          project.evaluacion.revisionConfirmada &&
          !project.evaluacion.avalEmitido,
      ),
      calificaciones: data.filter(
        (project) =>
          project.rolJurado !== RolJuradoProyecto.Revisor &&
          project.evaluacion.avalEmitido &&
          !project.evaluacion.calificacionEnviada,
      ),
    };
  });

  setSelectedProject(projectId: number): void {
    this.selectedProjectId.set(projectId);
  }

  getProject(projectId: number): JuradoProyecto | undefined {
    return this.projects().find((project) => project.id === projectId);
  }

  getRolLabel(role: RolJuradoProyecto): string {
    const labels: Record<RolJuradoProyecto, string> = {
      [RolJuradoProyecto.Revisor]: 'Jurado Revisor',
      [RolJuradoProyecto.Evaluador]: 'Jurado Evaluador',
      [RolJuradoProyecto.Ambos]: 'Ambos roles',
    };
    return labels[role];
  }

  getEstadoLabel(status: EstadoJuradoProyecto): string {
    const labels: Record<EstadoJuradoProyecto, string> = {
      [EstadoJuradoProyecto.PendienteRevision]: 'Pendiente revisión',
      [EstadoJuradoProyecto.RevisadoConObservaciones]: 'Revisado con observaciones',
      [EstadoJuradoProyecto.Aprobado]: 'Aprobado',
      [EstadoJuradoProyecto.AvalEmitido]: 'Aval emitido',
      [EstadoJuradoProyecto.Finalizado]: 'Finalizado',
    };
    return labels[status];
  }

  getPhaseLabel(phase: FaseJuradoProyecto): string {
    return phase === 'aprobacion' ? 'Aprobación' : 'Evaluación';
  }

  getNotificationIcon(type: TipoNotificacionJurado): string {
    const icons: Record<TipoNotificacionJurado, string> = {
      asignacion: 'assignment_ind',
      propuesta: 'description',
      ajustes: 'sync_alt',
      plazo: 'schedule',
      informe_final: 'article',
      sustentacion: 'event',
      calificacion_otro_jurado: 'fact_check',
    };
    return icons[type];
  }

  formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('es-CO', options ?? { dateStyle: 'medium' }).format(new Date(value));
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }

  markAllNotificationsRead(): void {
    this.notifications.update((items) => items.map((item) => ({ ...item, leida: true })));
  }

  markNotificationRead(notificationId: number): void {
    this.notifications.update((items) =>
      items.map((item) => (item.id === notificationId ? { ...item, leida: true } : item)),
    );
  }

  emitirObservaciones(projectId: number, iterationId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.iteraciones = project.iteraciones.map((iteration) =>
        iteration.id === iterationId
          ? {
              ...iteration,
              estado: 'observaciones_emitidas',
              observacionesJurado: observation,
              fechaRespuesta: nowIso(),
            }
          : iteration,
      );
      project.estado = EstadoJuradoProyecto.RevisadoConObservaciones;
      project.historial.unshift(this.createHistory('Observaciones emitidas', observation));
      return project;
    });
    this.pushNotification(projectId, 'ajustes', 'Observaciones enviadas', 'Se notificó al estudiante y al asesor.');
  }

  aprobarPropuesta(projectId: number, iterationId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.iteraciones = project.iteraciones.map((iteration) =>
        iteration.id === iterationId
          ? {
              ...iteration,
              estado: 'aprobada',
              observacionesJurado: observation,
              fechaRespuesta: nowIso(),
            }
          : iteration,
      );
      project.estado = EstadoJuradoProyecto.Aprobado;
      project.historial.unshift(this.createHistory('Propuesta aprobada', observation || 'Aprobada sin observaciones adicionales.'));
      return project;
    });
    this.pushNotification(projectId, 'propuesta', 'Propuesta aprobada', 'Se notificó al Comité Curricular, estudiante y asesor.');
  }

  confirmarRevisionInforme(projectId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.evaluacion = {
        ...project.evaluacion,
        revisionConfirmada: true,
        observacionesRevision: observation,
      };
      project.estado = EstadoJuradoProyecto.Aprobado;
      project.historial.unshift(this.createHistory('Revisión del informe confirmada', observation || 'Informe confirmado.'));
      return project;
    });
  }

  enviarRetroalimentacion(projectId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      const nextRound: 2 = 2;
      project.evaluacion = {
        ...project.evaluacion,
        retroalimentacionPrevia: observation,
        rondaRetroalimentacion: nextRound,
        diasAjusteRestantes: 5,
      };
      project.estado = EstadoJuradoProyecto.RevisadoConObservaciones;
      project.historial.unshift(this.createHistory('Retroalimentación enviada', observation));
      return project;
    });
    this.pushNotification(projectId, 'informe_final', 'Retroalimentación enviada', 'Se notificó al estudiante para ajustes previos a sustentación.');
  }

  emitirAval(projectId: number, observation: string): void {
    this.updateProject(projectId, (project) => {
      project.evaluacion = {
        ...project.evaluacion,
        avalEmitido: true,
        observacionAval: observation,
        fechaAval: nowIso(),
      };
      project.estado = EstadoJuradoProyecto.AvalEmitido;
      project.historial.unshift(this.createHistory('Aval de sustentación emitido', observation || 'Aval emitido.'));
      return project;
    });
    this.pushNotification(projectId, 'sustentacion', 'Aval emitido', 'Se notificó al Comité Curricular el aval de sustentación.');
  }

  updateRubric(projectId: number, rubric: EvaluacionFinalJurado['rubric'], observations: string): void {
    this.updateProject(projectId, (project) => {
      project.evaluacion = {
        ...project.evaluacion,
        rubric,
        observacionesFinales: observations,
        calificacionEnviada: true,
      };
      project.estado = EstadoJuradoProyecto.Finalizado;
      project.historial.unshift(this.createHistory('Calificación definitiva enviada', observations));
      return project;
    });
    this.pushNotification(projectId, 'calificacion_otro_jurado', 'Calificación registrada', 'La calificación del jurado quedó registrada en el sistema.');
  }

  documentoSubtotal(rubric: EvaluacionFinalJurado['rubric']): number {
    return rubric.objetivos + rubric.originalidad + rubric.conclusiones + rubric.organizacion;
  }

  sustentacionSubtotal(rubric: EvaluacionFinalJurado['rubric']): number {
    return rubric.sustentacionPrivada + rubric.socializacionPublica;
  }

  totalScore(rubric: EvaluacionFinalJurado['rubric']): number {
    return this.documentoSubtotal(rubric) + this.sustentacionSubtotal(rubric);
  }

  cumpleMinimos(rubric: EvaluacionFinalJurado['rubric']): boolean {
    return this.documentoSubtotal(rubric) >= 36 && this.sustentacionSubtotal(rubric) >= 24;
  }

  private updateProject(projectId: number, updater: (project: JuradoProyecto) => JuradoProyecto): void {
    this.projects.update((items) =>
      items.map((item) => (item.id === projectId ? updater(structuredClone(item)) : item)),
    );
  }

  private createHistory(action: string, detail: string): HistorialJuradoProyecto {
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      fechaHora: nowIso(),
      accion: action,
      detalle: detail || 'Sin observaciones adicionales.',
    };
  }

  private pushNotification(
    projectId: number,
    type: TipoNotificacionJurado,
    title: string,
    description: string,
  ): void {
    const project = this.getProject(projectId);
    if (!project) return;

    this.notifications.update((items) => [
      {
        id: Date.now(),
        tipo: type,
        titulo: title,
        descripcion: description,
        estudiante: project.estudiantes.join(', '),
        proyecto: project.nombre,
        projectId,
        comoRol: project.rolJurado === RolJuradoProyecto.Evaluador ? 'evaluador' : 'revisor',
        fechaHora: nowIso(),
        leida: false,
      },
      ...items,
    ]);
  }
}
