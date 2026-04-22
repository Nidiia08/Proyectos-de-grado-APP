import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ComiteEstadoProyecto, ComiteService, ProyectoComite } from '../comite.service';
import { ProjectFormDialogComponent } from '../shared/project-form-dialog.component';
import { ProyectoDetalleComponent } from './proyecto-detalle/proyecto-detalle.component';

@Component({
  selector: 'app-comite-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, ProyectoDetalleComponent],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
})
export class ProyectosComponent {
  readonly comite = inject(ComiteService);
  private readonly dialog = inject(MatDialog);
  readonly modalityFilter = signal('todas');
  readonly phaseFilter = signal('todas');
  readonly statusFilter = signal('todos');
  readonly periodFilter = signal('todos');
  readonly advisorFilter = signal('');
  readonly search = signal('');
  readonly selectedProject = this.comite.selectedProject;
  readonly filteredProjects = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.comite.proyectos().filter((project) => {
      const modality = this.modalityFilter() === 'todas' || project.modalidad === this.modalityFilter() || project.subtipo === this.modalityFilter();
      const phase = this.phaseFilter() === 'todas' || project.faseActual === this.phaseFilter();
      const status = this.statusFilter() === 'todos' || project.estado === this.statusFilter();
      const period = this.periodFilter() === 'todos' || project.periodo === this.periodFilter();
      const advisor = !this.advisorFilter().trim() || project.asesor.toLowerCase().includes(this.advisorFilter().trim().toLowerCase());
      const matchesTerm = !term || project.nombre.toLowerCase().includes(term) || project.asesor.toLowerCase().includes(term) || project.estudiantes.some((s) => s.toLowerCase().includes(term));
      return modality && phase && status && period && advisor && matchesTerm;
    });
  });

  openCreateProject(): void {
    this.dialog.open(ProjectFormDialogComponent).afterClosed().subscribe((result) => {
      if (result) this.comite.createProject(result);
    });
  }

  selectProject(project: ProyectoComite): void {
    this.comite.setSelectedProject(project.id);
  }

  statusLabel(status: ComiteEstadoProyecto): string {
    return this.comite.getStatusLabel(status);
  }
}
