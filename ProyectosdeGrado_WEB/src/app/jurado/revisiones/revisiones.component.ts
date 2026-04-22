import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';
import { IteracionRevisionJurado, JuradoProyecto, JuradoService } from '../jurado.service';

@Component({
  selector: 'app-jurado-revisiones',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTabsModule],
  templateUrl: './revisiones.component.html',
  styleUrl: './revisiones.component.scss',
})
export class RevisionesComponent {
  readonly jurado = inject(JuradoService);
  private readonly dialog = inject(MatDialog);

  readonly buckets = this.jurado.reviewBuckets;
  observations: Record<string, string> = {};
  scores: Record<string, { objetivos: number; originalidad: number; conclusiones: number; organizacion: number; sustentacionPrivada: number; socializacionPublica: number; observacionesFinales: string }> = {};

  emitObservations(project: JuradoProyecto, iteration: IteracionRevisionJurado): void {
    const observation = this.observations[`it-${project.id}-${iteration.id}`] || '';
    this.openConfirm(
      'Emitir observaciones',
      'Se notificará al estudiante y al asesor para continuar la iteración.',
      'Emitir observaciones',
      observation,
      (value) => this.jurado.emitirObservaciones(project.id, iteration.id, value),
      true,
    );
  }

  approveProposal(project: JuradoProyecto, iteration: IteracionRevisionJurado): void {
    const observation = this.observations[`it-${project.id}-${iteration.id}`] || '';
    this.doubleConfirm(
      'Aprobar propuesta',
      'Esta aprobación es irreversible para la iteración seleccionada.',
      'Aprobar propuesta',
      observation,
      (value) => this.jurado.aprobarPropuesta(project.id, iteration.id, value),
    );
  }

  confirmFinalReview(project: JuradoProyecto): void {
    const observation = this.observations[`inf-${project.id}`] || '';
    this.openConfirm(
      'Confirmar revisión del informe',
      'Se registrará la revisión del informe final.',
      'Confirmar revisión',
      observation,
      (value) => this.jurado.confirmarRevisionInforme(project.id, value),
    );
  }

  emitAval(project: JuradoProyecto): void {
    const observation = this.observations[`aval-${project.id}`] || '';
    this.doubleConfirm(
      'Emitir aval',
      'El aval será notificado al Comité Curricular.',
      'Emitir aval',
      observation,
      (value) => this.jurado.emitirAval(project.id, value),
    );
  }

  scoreModel(project: JuradoProyecto) {
    if (!this.scores[project.id]) {
      this.scores[project.id] = {
        objetivos: project.evaluacion.rubric.objetivos,
        originalidad: project.evaluacion.rubric.originalidad,
        conclusiones: project.evaluacion.rubric.conclusiones,
        organizacion: project.evaluacion.rubric.organizacion,
        sustentacionPrivada: project.evaluacion.rubric.sustentacionPrivada,
        socializacionPublica: project.evaluacion.rubric.socializacionPublica,
        observacionesFinales: project.evaluacion.observacionesFinales || '',
      };
    }
    return this.scores[project.id];
  }

  documentSubtotal(project: JuradoProyecto): number {
    const s = this.scoreModel(project);
    return s.objetivos + s.originalidad + s.conclusiones + s.organizacion;
  }

  oralSubtotal(project: JuradoProyecto): number {
    const s = this.scoreModel(project);
    return s.sustentacionPrivada + s.socializacionPublica;
  }

  total(project: JuradoProyecto): number {
    return this.documentSubtotal(project) + this.oralSubtotal(project);
  }

  meetsMinimums(project: JuradoProyecto): boolean {
    return this.documentSubtotal(project) >= 36 && this.oralSubtotal(project) >= 24;
  }

  submitGrade(project: JuradoProyecto): void {
    const score = this.scoreModel(project);
    if (!score.observacionesFinales.trim()) return;
    if (!this.meetsMinimums(project)) return;
    if (
      score.objetivos > 25 ||
      score.originalidad > 10 ||
      score.conclusiones > 15 ||
      score.organizacion > 10 ||
      score.sustentacionPrivada > 30 ||
      score.socializacionPublica > 10
    ) {
      return;
    }

    this.doubleConfirm(
      'Enviar calificación definitiva',
      'Esta acción es irreversible y dejará la rúbrica en solo lectura.',
      'Enviar calificación definitiva',
      score.observacionesFinales,
      () =>
        this.jurado.updateRubric(
          project.id,
          {
            objetivos: score.objetivos,
            originalidad: score.originalidad,
            conclusiones: score.conclusiones,
            organizacion: score.organizacion,
            sustentacionPrivada: score.sustentacionPrivada,
            socializacionPublica: score.socializacionPublica,
          },
          score.observacionesFinales,
        ),
      true,
    );
  }

  private openConfirm(
    title: string,
    message: string,
    confirmText: string,
    observation: string,
    handler: (observation: string) => void,
    requireObservation = false,
  ): void {
    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      data: { title, message, confirmText, requireObservation },
    });
    ref.componentInstance.observation = observation;
    ref.afterClosed().subscribe((result) => {
      if (result?.confirmed) handler(result.observation);
    });
  }

  private doubleConfirm(
    title: string,
    message: string,
    confirmText: string,
    observation: string,
    handler: (observation: string) => void,
    requireObservation = false,
  ): void {
    const first = this.dialog.open(ConfirmActionDialogComponent, {
      data: { title, message, confirmText: 'Continuar', requireObservation },
    });
    first.componentInstance.observation = observation;
    first.afterClosed().subscribe((result) => {
      if (!result?.confirmed) return;
      this.dialog
        .open(ConfirmActionDialogComponent, {
          data: {
            title: 'Confirmación final',
            message: 'Confirme nuevamente para completar la acción irreversible.',
            confirmText,
          },
        })
        .afterClosed()
        .subscribe((confirm) => {
          if (confirm?.confirmed) handler(result.observation);
        });
    });
  }
}
