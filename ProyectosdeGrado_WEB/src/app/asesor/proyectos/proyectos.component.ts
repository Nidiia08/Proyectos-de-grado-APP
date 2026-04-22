import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { AsesorService, EstadoProyectoAsesor, ProyectoAsesor } from '../asesor.service';
import { ProyectoDetalleComponent } from './proyecto-detalle/proyecto-detalle.component';

@Component({
  selector: 'app-asesor-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    ProyectoDetalleComponent,
  ],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
})
export class ProyectosComponent {
  readonly asesor = inject(AsesorService);

  readonly modalityFilter = signal('todas');
  readonly phaseFilter = signal('todas');
  readonly statusFilter = signal('todos');
  readonly search = signal('');
  readonly selectedProject = this.asesor.selectedProject;

  readonly filteredProjects = computed(() => {
    const modality = this.modalityFilter();
    const phase = this.phaseFilter();
    const status = this.statusFilter();
    const term = this.search().trim().toLowerCase();

    return this.asesor.proyectosAsignados().filter((project) => {
      const matchesModality = modality === 'todas' || project.modalidad === modality || project.subtipo === modality;
      const matchesPhase = phase === 'todas' || project.faseActual === phase;
      const matchesStatus = status === 'todos' || project.estado === status;
      const matchesTerm =
        !term ||
        project.nombre.toLowerCase().includes(term) ||
        project.estudiantes.some((student) => student.toLowerCase().includes(term));

      return matchesModality && matchesPhase && matchesStatus && matchesTerm;
    });
  });

  readonly phaseOptions = [
    { value: 'todas', label: 'Todas las fases' },
    { value: 'inscripcion', label: 'Inscripción' },
    { value: 'aprobacion', label: 'Aprobación' },
    { value: 'desarrollo', label: 'Desarrollo' },
    { value: 'culminacion', label: 'Culminación' },
    { value: 'evaluacion', label: 'Evaluación' },
  ];

  readonly statusOptions = [
    { value: 'todos', label: 'Todos los estados' },
    { value: EstadoProyectoAsesor.EnCurso, label: 'En curso' },
    { value: EstadoProyectoAsesor.PendienteAccionAsesor, label: 'Pendiente acción asesor' },
    { value: EstadoProyectoAsesor.ConObservaciones, label: 'Con observaciones' },
    { value: EstadoProyectoAsesor.Finalizado, label: 'Finalizado' },
  ];

  selectProject(project: ProyectoAsesor): void {
    this.asesor.setSelectedProject(project.id);
  }

  phaseLabel(value: string): string {
    return this.asesor.getPhaseLabel(value as never);
  }

  statusLabel(status: EstadoProyectoAsesor): string {
    return this.asesor.getEstadoLabel(status);
  }
}
