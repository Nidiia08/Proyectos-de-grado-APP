import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import {
  ProjectModality,
  SocialSubtype,
  StudentProjectProfile,
  StudentWorkflowPhase,
  STUDENT_WORKFLOW_PHASES,
} from '../../core/student-project.types';

// ——— Acceso por fase ———
export type PhaseAccessMode = 'locked' | 'readonly' | 'active';
export type PhaseStatusLabel = 'Bloqueada' | 'Completada' | 'Activa';

// ——— Inscripción / Culminación (documentos) ———
export type DocumentUploadStatus = 'empty' | 'uploaded' | 'rejected';

export interface DocumentDefinition {
  id: string;
  label: string;
  required: boolean;
}

export interface DocumentSlotState {
  definition: DocumentDefinition;
  status: DocumentUploadStatus;
  fileName: string | null;
}

export interface InscripcionPhaseModel {
  committeeDeadlineIso: string;
  isGroupProject: boolean;
  additionalComment: string;
  submitted: boolean;
  pendingReview: boolean;
  documents: DocumentSlotState[];
}

export interface CulminacionPhaseModel {
  committeeDeadlineIso: string;
  cloudLink: string;
  additionalComment: string;
  submitted: boolean;
  pendingEvaluation: boolean;
  documents: DocumentSlotState[];
}

// ——— Aprobación ———
export type IteracionEstado =
  | 'pendiente'
  | 'en_revision_jurados'
  | 'con_observaciones'
  | 'aprobada';

export interface AprobacionIteracion {
  index: number;
  estado: IteracionEstado;
  observacionesJurados: string | null;
  diasHabilesRestantesEstudiante: number | null;
  ajusteFileName: string | null;
  comentarioEstudiante: string;
}

export interface AprobacionPhaseModel {
  modality: ProjectModality;
  socialSubtype: SocialSubtype | null;
  maxIteraciones: number;
  iteraciones: AprobacionIteracion[];
  acuerdoComiteFechaIso: string | null;
  propuestaAprobada: boolean;
  /** Solo pasantía: requisito acta antes de desarrollo */
  requiereActaCompromisoPasantia: boolean;
  actaCompromisoCumplida: boolean;
}

// ——— Desarrollo ———
export type InformeEstado = 'pendiente' | 'enviado' | 'aprobado' | 'con_observaciones';

export interface InformeTrimestral {
  numero: number;
  fechaMaxEntregaIso: string;
  estado: InformeEstado;
  observacion: string | null;
  fechaAprobacionIso: string | null;
  fileName: string | null;
  comentarioEstudiante: string;
  unlocked: boolean;
}

export interface DesarrolloPhaseModel {
  informesTotales: number;
  informes: InformeTrimestral[];
  prorrogaActiva: boolean;
  nuevaFechaFinIso: string | null;
}

// ——— Evaluación ———
export interface RubricaItem {
  nombre: string;
  puntosMax: number;
}

export interface RubricaBloque {
  titulo: string;
  puntosMaximoBloque: number;
  items: RubricaItem[];
}

export type EvaluacionPasoEstado = 'pendiente' | 'en_curso' | 'completado';

export interface EvaluacionTimelinePaso {
  id: string;
  label: string;
  estado: EvaluacionPasoEstado;
  detalle: string | null;
}

export type ResultadoEstadoMerito = 'aprobado' | 'reprobado' | 'meritorio' | 'laureado';

export interface EvaluacionResultado {
  visible: boolean;
  puntajeDocumento: number;
  puntajeSustentacion: number;
  total: number;
  estado: ResultadoEstadoMerito;
}

export interface EvaluacionPublicacionIndexada {
  aplica: boolean;
  clasificacion: 'A1_A' | 'B' | 'C' | null;
  puntajeAutomatico: number | null;
}

export interface EvaluacionPhaseModel {
  rubrica: RubricaBloque[];
  minimoAprobatorio: number;
  minimoDocumento: number;
  minimoSustentacion: number;
  timeline: EvaluacionTimelinePaso[];
  resultado: EvaluacionResultado;
  publicacion: EvaluacionPublicacionIndexada;
}

export interface EntregablesWorkflowState {
  currentPhase: StudentWorkflowPhase;
}

@Injectable({ providedIn: 'root' })
export class EntregablesService {
  private readonly auth = inject(AuthService);

  /** Estado de flujo (mock). Sustituir por respuesta API Django. */
  private readonly workflow = signal<EntregablesWorkflowState>({
    currentPhase: 'desarrollo',
  });

  readonly currentPhase = computed(() => this.workflow().currentPhase);

  phaseOrder(): readonly StudentWorkflowPhase[] {
    return STUDENT_WORKFLOW_PHASES;
  }

  phaseLabel(phase: StudentWorkflowPhase): string {
    const m: Record<StudentWorkflowPhase, string> = {
      inscripcion: 'Inscripción',
      aprobacion: 'Aprobación',
      desarrollo: 'Desarrollo',
      culminacion: 'Culminación',
      evaluacion: 'Evaluación',
    };
    return m[phase];
  }

  accessMode(phase: StudentWorkflowPhase): PhaseAccessMode {
    const cur = this.workflow().currentPhase;
    const ci = STUDENT_WORKFLOW_PHASES.indexOf(cur);
    const pi = STUDENT_WORKFLOW_PHASES.indexOf(phase);
    if (pi < ci) return 'readonly';
    if (pi === ci) return 'active';
    return 'locked';
  }

  phaseStatusLabel(phase: StudentWorkflowPhase): PhaseStatusLabel {
    const access = this.accessMode(phase);
    if (access === 'readonly') return 'Completada';
    if (access === 'active') return 'Activa';
    return 'Bloqueada';
  }

  getWorkflowState(): Observable<EntregablesWorkflowState> {
    return of(this.workflow()).pipe(delay(50));
  }

  /** Perfil del estudiante (modalidad) desde autenticación. */
  studentProfile(): StudentProjectProfile {
    return this.auth.studentProjectProfile();
  }

  // ——— Definiciones de documentos ———
  private documentosInscripcionInvestigacion(): DocumentDefinition[] {
    return [
      { id: 'propuesta', label: 'Propuesta de trabajo de grado', required: true },
      {
        id: 'hv_ocara',
        label: 'Estudio de Hoja de Vida expedido por OCARA (máx. 2 meses de antigüedad)',
        required: true,
      },
      {
        id: 'matricula_ocara',
        label: 'Certificado de matrícula expedido por OCARA (máx. 2 meses de antigüedad)',
        required: true,
      },
      {
        id: 'pago',
        label: 'Comprobante de pago de derechos de inscripción (copia legible)',
        required: true,
      },
      {
        id: 'formato_asesor',
        label: 'Formato de presentación de la propuesta refrendado por el asesor',
        required: true,
      },
      {
        id: 'aval_grupo',
        label: 'Aval refrendado por el director del proyecto y el director del grupo de investigación',
        required: true,
      },
      { id: 'otro', label: 'Otro documento', required: false },
    ];
  }

  private documentosInscripcionInteraccion(): DocumentDefinition[] {
    return [
      { id: 'propuesta', label: 'Propuesta de trabajo de grado', required: true },
      {
        id: 'hv_ocara',
        label: 'Estudio de Hoja de Vida expedido por OCARA (máx. 2 meses de antigüedad)',
        required: true,
      },
      {
        id: 'matricula_ocara',
        label: 'Certificado de matrícula expedido por OCARA (máx. 2 meses de antigüedad)',
        required: true,
      },
      {
        id: 'pago',
        label: 'Comprobante de pago de derechos de inscripción (copia legible)',
        required: true,
      },
      {
        id: 'formato_asesor',
        label: 'Formato de presentación de la propuesta refrendado por el asesor',
        required: true,
      },
      { id: 'otro', label: 'Otro documento', required: false },
    ];
  }

  getInscripcionDefinitions(profile: StudentProjectProfile): DocumentDefinition[] {
    return profile.modality === 'investigacion'
      ? this.documentosInscripcionInvestigacion()
      : this.documentosInscripcionInteraccion();
  }

  private documentosCulminacionInvestigacion(): DocumentDefinition[] {
    return [
      { id: 'matricula', label: 'Constancia de matrícula expedida por OCARA', required: true },
      { id: 'hv', label: 'Estudio de Hoja de Vida expedido por OCARA', required: true },
      {
        id: 'carta_director',
        label: 'Carta del director confirmando cumplimiento de objetivos y entrega de informes parciales',
        required: true,
      },
      {
        id: 'informe_final',
        label: 'Informe final / Artículo de revista indexada / Capítulo de libro',
        required: true,
      },
      {
        id: 'anexos',
        label: 'Archivos anexos: informes, códigos fuente, instaladores, etc.',
        required: true,
      },
    ];
  }

  private documentosCulminacionInteraccion(p: StudentProjectProfile): DocumentDefinition[] {
    const base: DocumentDefinition[] = [
      { id: 'matricula', label: 'Constancia de matrícula expedida por OCARA', required: true },
      { id: 'hv', label: 'Estudio de Hoja de Vida expedido por OCARA', required: true },
      {
        id: 'carta_asesor',
        label: 'Carta del asesor confirmando cumplimiento de objetivos y entrega de informes parciales',
        required: true,
      },
      {
        id: 'informe_ieee',
        label: 'Informe final con referencia a Norma IEEE',
        required: true,
      },
      {
        id: 'anexos',
        label: 'Archivos anexos: informes, códigos fuente, instaladores, etc.',
        required: true,
      },
    ];
    if (p.socialSubtype === 'pasantia') {
      base.push({
        id: 'aval_entidad',
        label: 'Aval de la entidad receptora (solo Pasantía)',
        required: true,
      });
    }
    return base;
  }

  getCulminacionDefinitions(profile: StudentProjectProfile): DocumentDefinition[] {
    return profile.modality === 'investigacion'
      ? this.documentosCulminacionInvestigacion()
      : this.documentosCulminacionInteraccion(profile);
  }

  /** Mock inscripción completo (GET Django). */
  getInscripcionModel(): Observable<InscripcionPhaseModel> {
    const profile = this.studentProfile();
    const defs = this.getInscripcionDefinitions(profile);
    const mock: InscripcionPhaseModel = {
      committeeDeadlineIso: '2026-05-15',
      isGroupProject: true,
      additionalComment: '',
      submitted: true,
      pendingReview: true,
      documents: defs.map((d, i) => ({
        definition: d,
        status: i < 4 ? 'uploaded' : i === 5 ? 'empty' : 'uploaded',
        fileName: i < 4 || d.id !== 'otro' ? `doc_${d.id}.pdf` : null,
      })),
    };
    return of(mock).pipe(delay(80));
  }

  /** Mock aprobación (GET Django). */
  getAprobacionModel(): Observable<AprobacionPhaseModel> {
    const profile = this.studentProfile();
    const inv = profile.modality === 'investigacion';
    const maxIt = inv ? 3 : 2;
    const model: AprobacionPhaseModel = {
      modality: profile.modality,
      socialSubtype: profile.socialSubtype,
      maxIteraciones: maxIt,
      iteraciones: [
        {
          index: 1,
          estado: 'aprobada',
          observacionesJurados: null,
          diasHabilesRestantesEstudiante: null,
          ajusteFileName: null,
          comentarioEstudiante: '',
        },
        {
          index: 2,
          estado: 'con_observaciones',
          observacionesJurados:
            'Ajustar la justificación del marco teórico y citar las fuentes en formato APA.',
          diasHabilesRestantesEstudiante: 7,
          ajusteFileName: null,
          comentarioEstudiante: '',
        },
      ],
      acuerdoComiteFechaIso: null,
      propuestaAprobada: false,
      requiereActaCompromisoPasantia: profile.socialSubtype === 'pasantia',
      actaCompromisoCumplida: false,
    };
    return of(model).pipe(delay(80));
  }

  getDesarrolloModel(): Observable<DesarrolloPhaseModel> {
    const profile = this.studentProfile();
    const meses = profile.modality === 'investigacion' ? 6 : 9;
    const totalInformes = meses <= 6 ? 2 : 3;
    const informes: InformeTrimestral[] = [
      {
        numero: 1,
        fechaMaxEntregaIso: '2026-03-30',
        estado: 'aprobado',
        observacion: null,
        fechaAprobacionIso: '2026-04-02',
        fileName: 'informe1.pdf',
        comentarioEstudiante: 'Primera versión.',
        unlocked: true,
      },
      {
        numero: 2,
        fechaMaxEntregaIso: '2026-06-30',
        estado: 'con_observaciones',
        observacion: 'Incluir tabla de resultados experimentales.',
        fechaAprobacionIso: null,
        fileName: 'informe2_v1.pdf',
        comentarioEstudiante: '',
        unlocked: true,
      },
    ];
    if (totalInformes > 2) {
      informes.push({
        numero: 3,
        fechaMaxEntregaIso: '2026-09-30',
        estado: 'pendiente',
        observacion: null,
        fechaAprobacionIso: null,
        fileName: null,
        comentarioEstudiante: '',
        unlocked: false,
      });
    }
    return of({
      informesTotales: totalInformes,
      informes,
      prorrogaActiva: true,
      nuevaFechaFinIso: '2026-11-30',
    }).pipe(delay(80));
  }

  getCulminacionModel(): Observable<CulminacionPhaseModel> {
    const profile = this.studentProfile();
    const defs = this.getCulminacionDefinitions(profile);
    return of({
      committeeDeadlineIso: '2026-12-01',
      cloudLink: '',
      additionalComment: '',
      submitted: false,
      pendingEvaluation: false,
      documents: defs.map((d) => ({
        definition: d,
        status: 'empty' as DocumentUploadStatus,
        fileName: null,
      })),
    }).pipe(delay(80));
  }

  getEvaluacionModel(): Observable<EvaluacionPhaseModel> {
    const profile = this.studentProfile();
    const inv = profile.modality === 'investigacion';
    const model: EvaluacionPhaseModel = {
      rubrica: [
        {
          titulo: 'Documento escrito',
          puntosMaximoBloque: 60,
          items: [
            { nombre: 'Cumplimiento de los objetivos', puntosMax: 25 },
            { nombre: 'Originalidad, ingenio y creatividad', puntosMax: 10 },
            { nombre: 'Validez y alcance de las conclusiones', puntosMax: 15 },
            { nombre: 'Organización y presentación del trabajo', puntosMax: 10 },
          ],
        },
        {
          titulo: 'Sustentación',
          puntosMaximoBloque: 40,
          items: [
            { nombre: 'Sustentación privada', puntosMax: 30 },
            { nombre: 'Socialización pública', puntosMax: 10 },
          ],
        },
      ],
      minimoAprobatorio: 60,
      minimoDocumento: 36,
      minimoSustentacion: 24,
      timeline: [
        {
          id: 'recibido',
          label: 'Documentos recibidos por el Comité Curricular',
          estado: 'completado',
          detalle: '15 nov 2026',
        },
        {
          id: 'asignacion',
          label: 'Asignación de jurados evaluadores',
          estado: 'completado',
          detalle: 'Jurado 1 y Jurado 2',
        },
        {
          id: 'revision',
          label: 'Revisión por jurados (plazo: 20 días)',
          estado: 'en_curso',
          detalle: null,
        },
        {
          id: 'ajustes',
          label: 'Ajustes del estudiante si aplica (plazo: 10 días → 5 días)',
          estado: 'pendiente',
          detalle: null,
        },
        {
          id: 'aval',
          label: 'Aval de sustentación emitido por jurados',
          estado: 'pendiente',
          detalle: null,
        },
        {
          id: 'privada',
          label: 'Sustentación privada (fecha y hora si está programada)',
          estado: 'pendiente',
          detalle: 'Por programar',
        },
        {
          id: 'publica',
          label: 'Socialización pública (mínimo 10 estudiantes asistentes)',
          estado: 'pendiente',
          detalle: null,
        },
        {
          id: 'acta',
          label: 'Acta de evaluación generada',
          estado: 'pendiente',
          detalle: null,
        },
      ],
      resultado: {
        visible: false,
        puntajeDocumento: 0,
        puntajeSustentacion: 0,
        total: 0,
        estado: 'aprobado',
      },
      publicacion: {
        aplica: inv,
        clasificacion: inv ? 'B' : null,
        puntajeAutomatico: inv ? 90 : null,
      },
    };
    return of(model).pipe(delay(80));
  }
}
