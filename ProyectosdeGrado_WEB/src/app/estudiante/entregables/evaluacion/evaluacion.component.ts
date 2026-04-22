import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import {
  EntregablesService,
  PhaseAccessMode,
  EvaluacionPhaseModel,
  EvaluacionTimelinePaso,
} from '../entregables.service';

@Component({
  selector: 'app-evaluacion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatStepperModule,
  ],
  templateUrl: './evaluacion.component.html',
  styleUrl: './evaluacion.component.scss',
})
export class EvaluacionComponent {
  @Input({ required: true }) access!: PhaseAccessMode;

  private readonly entregables = inject(EntregablesService);

  readonly model = toSignal(this.entregables.getEvaluacionModel());

  readonly displayedColumns = ['criterio', 'puntos'];

  estadoPaso(p: EvaluacionTimelinePaso): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      en_curso: 'En curso',
      completado: 'Completado',
    };
    return map[p.estado] ?? p.estado;
  }

  resultadoLabel(): string {
    const m = this.model();
    if (!m) return '';
    const map: Record<string, string> = {
      aprobado: 'Aprobado',
      reprobado: 'Reprobado',
      meritorio: 'Meritorio',
      laureado: 'Laureado',
    };
    return map[m.resultado.estado] ?? m.resultado.estado;
  }

  clasificacionLabel(): string {
    const m = this.model();
    if (!m?.publicacion.clasificacion) return '';
    const map: Record<string, string> = {
      A1_A: 'A1 o A',
      B: 'B',
      C: 'C',
    };
    return map[m.publicacion.clasificacion] ?? '';
  }
}
