import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { ConfirmActionDialogComponent } from '../../shared/confirm-action-dialog.component';
import { JuradoProyecto, JuradoService, RolJuradoProyecto, IteracionRevisionJurado } from '../../jurado.service';

@Component({
  selector: 'app-jurado-proyecto-detalle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatStepperModule,
  ],
  templateUrl: './proyecto-detalle.component.html',
  styleUrl: './proyecto-detalle.component.scss',
})
export class ProyectoDetalleComponent implements OnChanges {
  readonly jurado = inject(JuradoService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  @Input({ required: true }) project!: JuradoProyecto;

  readonly scoreForm = this.fb.group({
    objetivos: [0, [Validators.min(0), Validators.max(25)]],
    originalidad: [0, [Validators.min(0), Validators.max(10)]],
    conclusiones: [0, [Validators.min(0), Validators.max(15)]],
    organizacion: [0, [Validators.min(0), Validators.max(10)]],
    sustentacionPrivada: [0, [Validators.min(0), Validators.max(30)]],
    socializacionPublica: [0, [Validators.min(0), Validators.max(10)]],
    observacionesFinales: ['', [Validators.required]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && this.project) {
      this.scoreForm.patchValue({
        ...this.project.evaluacion.rubric,
        observacionesFinales: this.project.evaluacion.observacionesFinales || '',
      });

      if (this.project.evaluacion.calificacionEnviada) {
        this.scoreForm.disable({ emitEvent: false });
      } else {
        this.scoreForm.enable({ emitEvent: false });
      }
    }
  }

  get canReviewProposal(): boolean {
    return this.project.rolJurado !== RolJuradoProyecto.Evaluador;
  }

  get canEvaluate(): boolean {
    return this.project.rolJurado !== RolJuradoProyecto.Revisor;
  }

  documentoSubtotal(): number {
    const rubric = this.currentRubric();
    return this.jurado.documentoSubtotal(rubric);
  }

  sustentacionSubtotal(): number {
    const rubric = this.currentRubric();
    return this.jurado.sustentacionSubtotal(rubric);
  }

  total(): number {
    const rubric = this.currentRubric();
    return this.jurado.totalScore(rubric);
  }

  approved(): boolean {
    return this.total() >= 60 && this.jurado.cumpleMinimos(this.currentRubric());
  }

  hasApprovedIteration(): boolean {
    return this.project.iteraciones.some((item) => item.estado === 'aprobada');
  }

  sendObservations(iteration: IteracionRevisionJurado, observation: string): void {
    this.openConfirm(
      'Emitir observaciones',
      `Se enviarán observaciones de la iteración ${iteration.numero} al estudiante y al asesor.`,
      'Emitir observaciones',
      observation,
      (value) => this.jurado.emitirObservaciones(this.project.id, iteration.id, value),
      true,
    );
  }

  approveProposal(iteration: IteracionRevisionJurado, observation: string): void {
    this.doubleConfirm(
      'Aprobar propuesta',
      'Esta acción aprueba la propuesta y notificará al Comité Curricular, estudiante y asesor.',
      'Aprobar propuesta',
      observation,
      (value) => this.jurado.aprobarPropuesta(this.project.id, iteration.id, value),
    );
  }

  confirmReportReview(observation: string): void {
    this.openConfirm(
      'Confirmar recepción y revisión',
      'Se registrará la recepción y revisión del informe final.',
      'Confirmar revisión',
      observation,
      (value) => this.jurado.confirmarRevisionInforme(this.project.id, value),
    );
  }

  sendFeedback(observation: string): void {
    this.openConfirm(
      'Enviar retroalimentación',
      'Se notificará al estudiante para ajustes previos a la sustentación.',
      'Enviar retroalimentación',
      observation,
      (value) => this.jurado.enviarRetroalimentacion(this.project.id, value),
      true,
    );
  }

  emitAval(observation: string): void {
    this.doubleConfirm(
      'Emitir aval de sustentación',
      'Una vez emitido el aval se notificará al Comité Curricular.',
      'Emitir aval',
      observation,
      (value) => this.jurado.emitirAval(this.project.id, value),
    );
  }

  submitGrade(): void {
    this.scoreForm.markAllAsTouched();
    const observations = this.scoreForm.getRawValue().observacionesFinales || '';
    if (this.scoreForm.invalid) return;
    if (!this.jurado.cumpleMinimos(this.currentRubric())) return;

    this.doubleConfirm(
      'Enviar calificación',
      'Esta acción es irreversible y no permitirá nuevas modificaciones.',
      'Enviar calificación',
      observations,
      () => {
        this.jurado.updateRubric(this.project.id, this.currentRubric(), observations);
        this.scoreForm.disable({ emitEvent: false });
      },
      true,
    );
  }

  currentRubric() {
    const value = this.scoreForm.getRawValue();
    return {
      objetivos: Number(value.objetivos) || 0,
      originalidad: Number(value.originalidad) || 0,
      conclusiones: Number(value.conclusiones) || 0,
      organizacion: Number(value.organizacion) || 0,
      sustentacionPrivada: Number(value.sustentacionPrivada) || 0,
      socializacionPublica: Number(value.socializacionPublica) || 0,
    };
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
    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      data: { title, message, confirmText: 'Continuar', requireObservation },
    });
    ref.componentInstance.observation = observation;
    ref.afterClosed().subscribe((first) => {
      if (!first?.confirmed) return;
      this.dialog
        .open(ConfirmActionDialogComponent, {
          data: {
            title: 'Confirmación final',
            message: 'Confirme nuevamente para completar la acción irreversible.',
            confirmText,
          },
        })
        .afterClosed()
        .subscribe((second) => {
          if (second?.confirmed) handler(first.observation);
        });
    });
  }
}
