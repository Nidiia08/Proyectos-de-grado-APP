import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
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
  modality: ProjectModality;
  socialSubtype: SocialSubtype | null;
  statusLabel: string;
  currentPhase: ProjectPhase;
}

const MOCK_SUMMARY: StudentDashboardSummary = {
  studentName: 'Laura Marcela Vélez Ortiz',
  modality: 'interaccion_social',
  socialSubtype: 'proyecto_desarrollo_software',
  statusLabel: 'En desarrollo',
  currentPhase: 'desarrollo',
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getStudentDashboard(): Observable<StudentDashboardSummary> {
    return of(MOCK_SUMMARY).pipe(delay(150));
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
