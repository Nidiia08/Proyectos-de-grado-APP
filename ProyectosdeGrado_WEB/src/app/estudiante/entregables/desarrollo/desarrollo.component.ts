import { Component, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  EntregablesService,
  PhaseAccessMode,
  DesarrolloPhaseModel,
  InformeTrimestral,
} from '../entregables.service';

@Component({
  selector: 'app-desarrollo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './desarrollo.component.html',
  styleUrl: './desarrollo.component.scss',
})
export class DesarrolloComponent {
  @Input({ required: true }) access!: PhaseAccessMode;

  private readonly entregables = inject(EntregablesService);

  readonly model = toSignal(this.entregables.getDesarrolloModel());

  informes: InformeTrimestral[] = [];

  constructor() {
    effect(() => {
      const m = this.model();
      if (m) {
        this.informes = JSON.parse(JSON.stringify(m.informes)) as InformeTrimestral[];
      }
    });
  }

  get canInteract(): boolean {
    return this.access === 'active';
  }

  get approvedCount(): number {
    return this.informes.filter((i) => i.estado === 'aprobado').length;
  }

  progressValue(m: DesarrolloPhaseModel): number {
    const done = this.approvedCount;
    return (done / m.informesTotales) * 100;
  }

  estadoLabel(i: InformeTrimestral): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      enviado: 'Enviado',
      aprobado: 'Aprobado',
      con_observaciones: 'Con observaciones',
    };
    return map[i.estado] ?? i.estado;
  }

  onFile(inf: InformeTrimestral, ev: Event): void {
    if (!this.canInteract || !inf.unlocked) return;
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f || !/\.(pdf|docx)$/i.test(f.name)) return;
    inf.fileName = f.name;
    if (inf.estado === 'pendiente') inf.estado = 'enviado';
    (ev.target as HTMLInputElement).value = '';
  }

  enviarInforme(inf: InformeTrimestral): void {
    if (!this.canInteract || !inf.unlocked || !inf.fileName) return;
    inf.estado = 'enviado';
  }

  openFile(n: number): void {
    document.getElementById(`inf-${n}`)?.click();
  }

  formatIso(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
