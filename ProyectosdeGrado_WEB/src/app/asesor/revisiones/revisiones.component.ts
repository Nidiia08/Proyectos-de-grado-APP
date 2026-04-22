import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { AsesorService, InformeTrimestral, IteracionAprobacion, ProyectoAsesor } from '../asesor.service';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';

@Component({
  selector: 'app-asesor-revisiones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
  ],
  templateUrl: './revisiones.component.html',
  styleUrl: './revisiones.component.scss',
})
export class RevisionesComponent {
  readonly asesor = inject(AsesorService);
  private readonly dialog = inject(MatDialog);

  readonly buckets = this.asesor.reviewBuckets;
  observations: Record<string, string> = {};

  approveInscripcion(project: ProyectoAsesor): void {
    this.openAction(
      'Refrendar y aprobar',
      `Se notificará al Comité Curricular y al estudiante para el proyecto "${project.nombre}".`,
      'Refrendar y aprobar',
      this.observations[`ins-${project.id}`],
      (observation) => this.asesor.refrendarPropuesta(project.id, observation),
    );
  }

  requestInscripcionCorrections(project: ProyectoAsesor): void {
    this.openAction(
      'Solicitar correcciones',
      `Se devolverán observaciones al estudiante para el proyecto "${project.nombre}".`,
      'Solicitar correcciones',
      this.observations[`ins-${project.id}`],
      (observation) => this.asesor.solicitarCorreccionesInscripcion(project.id, observation),
      true,
    );
  }

  approveAdjustments(project: ProyectoAsesor, iteration: IteracionAprobacion): void {
    this.openAction(
      'Refrendar ajustes y enviar a jurados',
      `Se refrendará la iteración ${iteration.iteracion} y se enviará a jurados.`,
      'Refrendar ajustes',
      this.observations[`adj-${project.id}-${iteration.id}`],
      (observation) => this.asesor.refrendarAjustes(project.id, iteration.id, observation),
    );
  }

  requestAdjustmentCorrections(project: ProyectoAsesor, iteration: IteracionAprobacion): void {
    this.openAction(
      'Solicitar correcciones al estudiante',
      'El estudiante recibirá las observaciones para ajustar el documento antes del envío a jurados.',
      'Solicitar correcciones',
      this.observations[`adj-${project.id}-${iteration.id}`],
      (observation) => this.asesor.solicitarCorreccionesAjustes(project.id, iteration.id, observation),
      true,
    );
  }

  markReportReviewed(project: ProyectoAsesor, report: InformeTrimestral): void {
    this.openAction(
      'Marcar como revisado',
      `Se registrará el informe trimestral ${report.numero} como revisado.`,
      'Marcar revisado',
      this.observations[`rep-${project.id}-${report.id}`],
      (observation) => this.asesor.marcarInformeRevisado(project.id, report.id, observation),
    );
  }

  sendReportObservations(project: ProyectoAsesor, report: InformeTrimestral): void {
    this.openAction(
      'Enviar observaciones al estudiante',
      `El estudiante recibirá observaciones sobre el informe trimestral ${report.numero}.`,
      'Enviar observaciones',
      this.observations[`rep-${project.id}-${report.id}`],
      (observation) => this.asesor.enviarObservacionesInforme(project.id, report.id, observation),
      true,
    );
  }

  emitCarta(project: ProyectoAsesor): void {
    this.openAction(
      'Emitir carta de cumplimiento',
      `Se generará la carta de cumplimiento para el proyecto "${project.nombre}".`,
      'Emitir carta',
      this.observations[`cul-${project.id}`],
      (observation) => this.asesor.emitirCartaCumplimiento(project.id, observation),
    );
  }

  private openAction(
    title: string,
    message: string,
    confirmText: string,
    observation: string,
    handler: (observation: string) => void,
    requireObservation = false,
  ): void {
    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      data: {
        title,
        message,
        confirmText,
        requireObservation,
      },
    });

    ref.componentInstance.observation = observation || '';

    ref.afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        handler(result.observation);
      }
    });
  }
}
