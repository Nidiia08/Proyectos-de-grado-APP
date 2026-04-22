import { Component, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import {
  EntregablesService,
  PhaseAccessMode,
  DocumentSlotState,
  CulminacionPhaseModel,
} from '../entregables.service';

@Component({
  selector: 'app-culminacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './culminacion.component.html',
  styleUrl: './culminacion.component.scss',
})
export class CulminacionComponent {
  @Input({ required: true }) access!: PhaseAccessMode;

  private readonly entregables = inject(EntregablesService);

  readonly model = toSignal(this.entregables.getCulminacionModel());

  slots: DocumentSlotState[] = [];
  comment = '';
  cloudLink = '';
  submittedLocal = false;

  constructor() {
    effect(() => {
      const m = this.model();
      if (m) {
        this.slots = JSON.parse(JSON.stringify(m.documents)) as DocumentSlotState[];
        this.comment = m.additionalComment;
        this.cloudLink = m.cloudLink;
        this.submittedLocal = m.submitted;
      }
    });
  }

  get canEdit(): boolean {
    return this.access === 'active' && !this.submittedLocal;
  }

  get allRequiredUploaded(): boolean {
    return this.slots.filter((s) => s.definition.required).every((s) => s.status === 'uploaded');
  }

  onFileSelected(slot: DocumentSlotState, event: Event): void {
    if (!this.canEdit) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!/\.(pdf|docx|jpe?g|png)$/i.test(file.name)) return;
    slot.fileName = file.name;
    slot.status = 'uploaded';
    input.value = '';
  }

  replace(slot: DocumentSlotState): void {
    if (!this.canEdit) return;
    slot.status = 'empty';
    slot.fileName = null;
  }

  enviar(): void {
    if (!this.canEdit || !this.allRequiredUploaded) return;
    this.submittedLocal = true;
  }

  openPicker(id: string): void {
    document.getElementById(`culm-${id}`)?.click();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  statusLabel(s: DocumentSlotState): string {
    if (s.status === 'uploaded') return 'Cargado';
    if (s.status === 'rejected') return 'Rechazado';
    return 'Sin cargar';
  }
}
