import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule } from '@angular/forms';
import { AssignJuriesDialogComponent } from '../../shared/assign-juries-dialog.component';
import { ConfirmActionDialogComponent } from '../../shared/confirm-action-dialog.component';
import { ComiteService, ProyectoComite } from '../../comite.service';

@Component({
  selector: 'app-comite-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatListModule, MatStepperModule],
  templateUrl: './proyecto-detalle.component.html',
  styleUrl: './proyecto-detalle.component.scss',
})
export class ProyectoDetalleComponent {
  readonly comite = inject(ComiteService);
  private readonly dialog = inject(MatDialog);
  @Input({ required: true }) project!: ProyectoComite;
  observationInscripcion = '';
  extensionReason = '';
  extensionDate = '';
  schedulePrivate = '';
  schedulePublic = '';

  assignReviewers(): void {
    this.dialog.open(AssignJuriesDialogComponent, { data: { available: this.comite.juradosDisponibles() } }).afterClosed().subscribe((result) => {
      if (result?.juries?.length === 2) this.confirmDouble('Aprobar inscripción y asignar jurados revisores', 'Esta acción generará acuerdo de aprobación de inscripción.', result.observation, (obs) => this.comite.approveInscription(this.project.id, obs, result.juries));
    });
  }

  assignEvaluators(): void {
    this.dialog.open(AssignJuriesDialogComponent, { data: { available: this.comite.juradosDisponibles() } }).afterClosed().subscribe((result) => {
      if (result?.juries?.length === 2) this.confirmDouble('Aprobar culminación y asignar jurados evaluadores', 'Se notificará a estudiante, asesor y jurados.', result.observation, (obs) => this.comite.approveCulmination(this.project.id, obs, result.juries));
    });
  }

  requestCorrections(phase: string): void {
    this.confirmSingle(`Solicitar correcciones en ${phase}`, 'Se devolverán observaciones al estudiante.', (obs) => this.comite.requestCorrections(this.project.id, phase, obs), true);
  }

  emitProjectApproval(): void {
    this.confirmDouble('Emitir acuerdo de aprobación del proyecto', 'El proyecto iniciará oficialmente la fase de desarrollo.', '', () => this.comite.emitApprovalAgreement(this.project.id));
  }

  registerExtension(): void {
    if (!this.extensionDate || !this.extensionReason.trim()) return;
    this.confirmSingle('Registrar prórroga', 'Se actualizará la fecha límite del proyecto.', () => this.comite.registerExtension(this.project.id, this.extensionDate, this.extensionReason), true);
  }

  scheduleDefense(): void {
    if (!this.schedulePrivate || !this.schedulePublic) return;
    this.confirmSingle('Programar sustentación', 'Se registrarán fecha y hora de sustentación privada y socialización pública.', () => this.comite.scheduleDefense(this.project.id, this.schedulePrivate, this.schedulePublic));
  }

  generateFinalAct(): void {
    this.confirmDouble('Generar acta de evaluación final', 'Esta acción genera el acta final con la nota consolidada.', '', () => this.comite.generateFinalAct(this.project.id));
  }

  private confirmSingle(title: string, message: string, handler: (observation: string) => void, requireObservation = false): void {
    this.dialog.open(ConfirmActionDialogComponent, { data: { title, message, confirmText: 'Confirmar', requireObservation } }).afterClosed().subscribe((result) => {
      if (result?.confirmed) handler(result.observation);
    });
  }

  private confirmDouble(title: string, message: string, observation: string, handler: (observation: string) => void): void {
    const first = this.dialog.open(ConfirmActionDialogComponent, { data: { title, message, confirmText: 'Continuar' } });
    first.componentInstance.observation = observation;
    first.afterClosed().subscribe((stepOne) => {
      if (!stepOne?.confirmed) return;
      this.dialog.open(ConfirmActionDialogComponent, { data: { title: 'Confirmación final', message: 'Confirme nuevamente para completar la acción.', confirmText: 'Confirmar' } }).afterClosed().subscribe((stepTwo) => {
        if (stepTwo?.confirmed) handler(stepOne.observation);
      });
    });
  }
}
