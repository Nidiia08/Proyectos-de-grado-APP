import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import {
  ProjectModality,
  SocialSubtype,
  StudentWorkflowPhase,
  STUDENT_WORKFLOW_PHASES,
} from '../../core/student-project.types';

export type { ProjectModality, SocialSubtype };
export type ProjectPhase = StudentWorkflowPhase;
export const PROJECT_PHASES_ORDER = STUDENT_WORKFLOW_PHASES;

export interface StudentDashboardSummary {
  studentName: string;
  projectName: string;
  modality: ProjectModality;
  socialSubtype: SocialSubtype | null;
  statusLabel: string;
  currentPhase: ProjectPhase;
}

interface ApiResponse<T> {
  mensaje: string;
  datos: T;
}

interface ProyectoDashboardApi {
  nombre: string;
  modalidad: 'INVESTIGACION' | 'INTERACCION_SOCIAL';
  subtipo?: 'PASANTIA' | 'DESARROLLO_SOFTWARE' | 'INTERVENCION' | null;
  fase_actual: 'INSCRIPCION' | 'APROBACION' | 'DESARROLLO' | 'CULMINACION' | 'EVALUACION';
  estado: 'ACTIVO' | 'FINALIZADO' | 'CANCELADO' | 'REPROBADO';
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  getStudentDashboard(): Observable<StudentDashboardSummary> {
    return this.api.get<ApiResponse<ProyectoDashboardApi[]>>('proyectos/').pipe(
      map((response) => this.mapToSummary(response.datos?.[0])),
      catchError(() => of(this.mapToSummary(undefined))),
    );
  }

  private mapToSummary(project?: ProyectoDashboardApi): StudentDashboardSummary {
    const usuario = this.auth.usuario;
    const studentName = usuario
      ? `${usuario.nombre} ${usuario.apellido}`.trim()
      : 'Estudiante';

    if (!project) {
      return {
        studentName,
        projectName: 'Sin proyecto de grado registrado',
        modality: 'interaccion_social',
        socialSubtype: null,
        statusLabel: 'Sin proyecto asignado',
        currentPhase: 'inscripcion',
      };
    }

    return {
      studentName,
      projectName: project.nombre,
      modality: project.modalidad === 'INVESTIGACION' ? 'investigacion' : 'interaccion_social',
      socialSubtype: this.mapSubtipo(project.subtipo),
      statusLabel: this.mapEstado(project.estado),
      currentPhase: this.mapFase(project.fase_actual),
    };
  }

  private mapSubtipo(subtipo?: ProyectoDashboardApi['subtipo']): SocialSubtype | null {
    if (!subtipo) {
      return null;
    }

    const map: Record<NonNullable<ProyectoDashboardApi['subtipo']>, SocialSubtype> = {
      PASANTIA: 'pasantia',
      DESARROLLO_SOFTWARE: 'proyecto_desarrollo_software',
      INTERVENCION: 'proyecto_intervencion',
    };
    return map[subtipo];
  }

  private mapFase(fase: ProyectoDashboardApi['fase_actual']): ProjectPhase {
    const map: Record<ProyectoDashboardApi['fase_actual'], ProjectPhase> = {
      INSCRIPCION: 'inscripcion',
      APROBACION: 'aprobacion',
      DESARROLLO: 'desarrollo',
      CULMINACION: 'culminacion',
      EVALUACION: 'evaluacion',
    };
    return map[fase];
  }

  private mapEstado(estado: ProyectoDashboardApi['estado']): string {
    const map: Record<ProyectoDashboardApi['estado'], string> = {
      ACTIVO: 'Activo',
      FINALIZADO: 'Finalizado',
      CANCELADO: 'Cancelado',
      REPROBADO: 'Reprobado',
    };
    return map[estado];
  }

  modalityLabel(m: ProjectModality): string {
    return m === 'investigacion' ? 'Investigación' : 'Interacción social';
  }

  socialSubtypeLabel(s: SocialSubtype): string {
    const map: Record<SocialSubtype, string> = {
      pasantia: 'Pasantía',
      proyecto_desarrollo_software: 'Proyecto de desarrollo de software',
      proyecto_intervencion: 'Proyecto de intervención',
    };
    return map[s];
  }

  formatProjectType(summary: StudentDashboardSummary): string {
    const base = this.modalityLabel(summary.modality);
    if (summary.modality === 'interaccion_social' && summary.socialSubtype) {
      return `${base} · ${this.socialSubtypeLabel(summary.socialSubtype)}`;
    }
    return base;
  }

  phaseLabel(phase: ProjectPhase): string {
    const map: Record<ProjectPhase, string> = {
      inscripcion: 'Inscripción',
      aprobacion: 'Aprobación',
      desarrollo: 'Desarrollo',
      culminacion: 'Culminación',
      evaluacion: 'Evaluación',
    };
    return map[phase];
  }

  phaseIndex(phase: ProjectPhase): number {
    return PROJECT_PHASES_ORDER.indexOf(phase);
  }

  isPhaseCompleted(phase: ProjectPhase, current: ProjectPhase): boolean {
    return this.phaseIndex(phase) < this.phaseIndex(current);
  }
}
