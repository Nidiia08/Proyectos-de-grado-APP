import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { AsesorService, IteracionAprobacion, ProyectoAsesor, InformeTrimestral } from '../../asesor.service';
import { ConfirmActionDialogComponent } from '../../shared/confirm-action-dialog.component';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatStepperModule,
  ],
  templateUrl: './proyecto-detalle.component.html',
  styleUrl: './proyecto-detalle.component.scss',
})
export class ProyectoDetalleComponent {
  private readonly dialog = inject(MatDialog);
  readonly asesor = inject(AsesorService);

  @Input({ required: true }) project!: ProyectoAsesor;

  refrendarPropuesta(): void {
    this.openActionDialog(
      'Refrendar propuesta',
      'Confirme el refrendo de la propuesta y registre una observación opcional.',
      'Refrendar propuesta',
      (observation) => this.asesor.refrendarPropuesta(this.project.id, observation),
    );
  }

  refrendarAjustes(iteration: IteracionAprobacion): void {
    this.openActionDialog(
      'Refrendar ajustes',
      `Confirme el refrendo de los ajustes de la iteración ${iteration.iteracion}.`,
      'Refrendar ajustes',
      (observation) => this.asesor.refrendarAjustes(this.project.id, iteration.id, observation),
    );
  }

  agregarObservacion(report: InformeTrimestral): void {
    this.openActionDialog(
      'Agregar observación',
      `Registre la observación para el informe trimestral ${report.numero}.`,
      'Guardar observación',
      (observation) => this.asesor.addProjectObservation(this.project.id, 'desarrollo', observation),
      true,
    );
  }

  emitirCarta(): void {
    this.openActionDialog(
      'Emitir carta de cumplimiento',
      'Confirme que el estudiante cumplió los objetivos y entregó los informes parciales requeridos.',
      'Emitir carta',
      (observation) => this.asesor.emitirCartaCumplimiento(this.project.id, observation),
    );
  }

  phaseLabel(value: string): string {
    return this.asesor.getPhaseLabel(value as never);
  }

  private openActionDialog(
    title: string,
    message: string,
    confirmText: string,
    handler: (observation: string) => void,
    requireObservation = false,
  ): void {
    this.dialog
      .open(ConfirmActionDialogComponent, {
        data: {
          title,
          message,
          confirmText,
          requireObservation,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.confirmed) {
          handler(result.observation);
        }
      });
  }
}
