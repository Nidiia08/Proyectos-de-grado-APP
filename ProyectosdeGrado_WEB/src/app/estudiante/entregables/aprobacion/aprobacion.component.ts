import { Component, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import {
  EntregablesService,
  PhaseAccessMode,
  AprobacionPhaseModel,
  AprobacionIteracion,
} from '../entregables.service';

@Component({
  selector: 'app-aprobacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './aprobacion.component.html',
  styleUrl: './aprobacion.component.scss',
})
export class AprobacionComponent {
  @Input({ required: true }) access!: PhaseAccessMode;

  private readonly entregables = inject(EntregablesService);

  readonly model = toSignal(this.entregables.getAprobacionModel());

  iteraciones: AprobacionIteracion[] = [];

  constructor() {
    effect(() => {
      const m = this.model();
      if (m) {
        this.iteraciones = JSON.parse(JSON.stringify(m.iteraciones)) as AprobacionIteracion[];
      }
    });
  }

  get canInteract(): boolean {
    return this.access === 'active';
  }

  estadoLabel(it: AprobacionIteracion): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      en_revision_jurados: 'En revisión por jurados',
      con_observaciones: 'Con observaciones',
      aprobada: 'Aprobada',
    };
    return map[it.estado] ?? it.estado;
  }

  onFile(it: AprobacionIteracion, ev: Event): void {
    if (!this.canInteract || it.estado !== 'con_observaciones') return;
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f || !/\.(pdf|docx)$/i.test(f.name)) return;
    it.ajusteFileName = f.name;
    (ev.target as HTMLInputElement).value = '';
  }

  enviarAjustes(it: AprobacionIteracion): void {
    if (!this.canInteract || !it.ajusteFileName) return;
    it.estado = 'en_revision_jurados';
  }

  openFile(id: number): void {
    document.getElementById(`ajuste-${id}`)?.click();
  }

  formatIso(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
