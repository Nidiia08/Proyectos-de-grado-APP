import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { JuradoProyecto, JuradoService, RolJuradoProyecto, EstadoJuradoProyecto } from '../jurado.service';
import { ProyectoDetalleComponent } from './proyecto-detalle/proyecto-detalle.component';

@Component({
  selector: 'app-jurado-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule, ProyectoDetalleComponent],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
})
export class ProyectosComponent {
  readonly jurado = inject(JuradoService);

  readonly roleFilter = signal('todos');
  readonly modalityFilter = signal('todas');
  readonly statusFilter = signal('todos');
  readonly search = signal('');
  readonly selectedProject = this.jurado.selectedProject;

  readonly filteredProjects = computed(() => {
    const role = this.roleFilter();
    const modality = this.modalityFilter();
    const status = this.statusFilter();
    const term = this.search().trim().toLowerCase();

    return this.jurado.proyectos().filter((project) => {
      const matchesRole = role === 'todos' || project.rolJurado === role;
      const matchesModality = modality === 'todas' || project.modalidad === modality || project.subtipo === modality;
      const matchesStatus = status === 'todos' || project.estado === status;
      const matchesTerm =
        !term ||
        project.nombre.toLowerCase().includes(term) ||
        project.estudiantes.some((student) => student.toLowerCase().includes(term));
      return matchesRole && matchesModality && matchesStatus && matchesTerm;
    });
  });

  selectProject(project: JuradoProyecto): void {
    this.jurado.setSelectedProject(project.id);
  }

  roleLabel(role: RolJuradoProyecto): string {
    return this.jurado.getRolLabel(role);
  }

  statusLabel(status: EstadoJuradoProyecto): string {
    return this.jurado.getEstadoLabel(status);
  }

  phaseLabel(phase: 'aprobacion' | 'evaluacion'): string {
    return this.jurado.getPhaseLabel(phase);
  }
}
