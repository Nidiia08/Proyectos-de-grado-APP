import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { STUDENT_WORKFLOW_PHASES, StudentWorkflowPhase } from '../../core/student-project.types';
import { AprobacionComponent } from './aprobacion/aprobacion.component';
import { CulminacionComponent } from './culminacion/culminacion.component';
import { DesarrolloComponent } from './desarrollo/desarrollo.component';
import { EntregablesService } from './entregables.service';
import { EvaluacionComponent } from './evaluacion/evaluacion.component';
import { InscripcionComponent } from './inscripcion/inscripcion.component';

@Component({
  selector: 'app-estudiante-entregables',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    InscripcionComponent,
    AprobacionComponent,
    DesarrolloComponent,
    CulminacionComponent,
    EvaluacionComponent,
  ],
  templateUrl: './entregables.component.html',
  styleUrl: './entregables.component.scss',
})
export class EntregablesComponent {
  private readonly entregables = inject(EntregablesService);

  readonly phases = STUDENT_WORKFLOW_PHASES;
  readonly currentPhase = this.entregables.currentPhase;
  readonly selectedPhase = signal<StudentWorkflowPhase>(this.entregables.currentPhase());
  readonly completedCount = computed(() =>
    this.phases.filter((phase) => this.isCompleted(phase)).length,
  );
  readonly lockedCount = computed(() =>
    this.phases.filter((phase) => this.locked(phase)).length,
  );
  readonly progressPercent = computed(() =>
    Math.round(((this.completedCount() + (this.hasActivePhase() ? 1 : 0)) / this.phases.length) * 100),
  );

  label(phase: StudentWorkflowPhase): string {
    return this.entregables.phaseLabel(phase);
  }

  access(phase: StudentWorkflowPhase) {
    return this.entregables.accessMode(phase);
  }

  locked(phase: StudentWorkflowPhase): boolean {
    return this.access(phase) === 'locked';
  }

  isCurrent(phase: StudentWorkflowPhase): boolean {
    return this.access(phase) === 'active';
  }

  isCompleted(phase: StudentWorkflowPhase): boolean {
    return this.access(phase) === 'readonly';
  }

  hasActivePhase(): boolean {
    return this.phases.some((phase) => this.isCurrent(phase));
  }

  phaseStateLabel(phase: StudentWorkflowPhase): string {
    return this.entregables.phaseStatusLabel(phase);
  }

  selectPhase(phase: StudentWorkflowPhase): void {
    if (this.locked(phase)) {
      return;
    }
    this.selectedPhase.set(phase);
  }

  modalityHint(): string {
    const profile = this.entregables.studentProfile();
    if (profile.modality === 'investigacion') {
      return 'Modalidad investigacion';
    }

    const subtype = profile.socialSubtype;
    const labels: Record<string, string> = {
      pasantia: 'Modalidad interaccion social - Pasantia',
      proyecto_desarrollo_software: 'Modalidad interaccion social - Proyecto de desarrollo de software',
      proyecto_intervencion: 'Modalidad interaccion social - Proyecto de intervencion',
    };

    return subtype ? labels[subtype] ?? 'Interaccion social' : 'Interaccion social';
  }

  phaseDescription(phase: StudentWorkflowPhase): string {
    const descriptions: Record<StudentWorkflowPhase, string> = {
      inscripcion: 'Carga los documentos iniciales y formaliza la solicitud ante el comite.',
      aprobacion: 'Consulta observaciones, adjunta ajustes y da seguimiento a la aprobacion.',
      desarrollo: 'Gestiona informes parciales y controla el avance del proyecto.',
      culminacion: 'Entrega documentos finales y soportes de cierre del trabajo de grado.',
      evaluacion: 'Sigue la sustentacion, la publicacion de resultados y el cierre del proceso.',
    };
    return descriptions[phase];
  }

  helperText(phase: StudentWorkflowPhase): string {
    const access = this.access(phase);
    if (access === 'active') return 'Puedes continuar con esta fase ahora mismo.';
    if (access === 'readonly') return 'Esta fase ya fue enviada. Puedes consultarla en modo lectura.';
    return 'Se habilitara automaticamente cuando completes la fase actual.';
  }
}
