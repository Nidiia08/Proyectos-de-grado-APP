import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import {
  DashboardService,
  PROJECT_PHASES_ORDER,
  ProjectPhase,
  StudentDashboardSummary,
} from './dashboard.service';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatStepperModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly summary = toSignal(this.dashboardService.getStudentDashboard());

  readonly phases = PROJECT_PHASES_ORDER.map((id) => ({
    id,
    label: this.dashboardService.phaseLabel(id),
  }));

  activeStepIndex(summary: StudentDashboardSummary): number {
    return PROJECT_PHASES_ORDER.indexOf(summary.currentPhase);
  }

  stepCompleted(phase: ProjectPhase, summary: StudentDashboardSummary): boolean {
    return this.dashboardService.isPhaseCompleted(phase, summary.currentPhase);
  }

  stepActive(phase: ProjectPhase, summary: StudentDashboardSummary): boolean {
    return phase === summary.currentPhase;
  }

  projectTypeText(summary: StudentDashboardSummary): string {
    return this.dashboardService.formatProjectType(summary);
  }

  completedPhasesCount(summary: StudentDashboardSummary): number {
    return this.activeStepIndex(summary) + 1;
  }

  progressPercent(summary: StudentDashboardSummary): number {
    return Math.round((this.completedPhasesCount(summary) / this.phases.length) * 100);
  }
}
