import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NavigationService } from '../../core/navigation.service';
import { EstadoJuradoProyecto, JuradoService, RolJuradoProyecto } from '../jurado.service';

@Component({
  selector: 'app-jurado-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatTableModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly jurado = inject(JuradoService);
  private readonly nav = inject(NavigationService);

  readonly perfil = this.jurado.perfil;
  readonly metrics = this.jurado.metrics;
  readonly alertas = this.jurado.alertas;
  readonly rows = this.jurado.proyectos;
  readonly displayedColumns = ['estudiantes', 'modalidad', 'rol', 'fase', 'estado', 'acciones'];
  readonly todayLabel = computed(() =>
    this.jurado.formatDate(this.perfil().fechaActual, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  readonly roleClassMap: Record<RolJuradoProyecto, string> = {
    [RolJuradoProyecto.Revisor]: 'role-chip role-chip--blue',
    [RolJuradoProyecto.Evaluador]: 'role-chip role-chip--green',
    [RolJuradoProyecto.Ambos]: 'role-chip role-chip--purple',
  };

  readonly statusClassMap: Record<EstadoJuradoProyecto, string> = {
    [EstadoJuradoProyecto.PendienteRevision]: 'status-chip status-chip--yellow',
    [EstadoJuradoProyecto.RevisadoConObservaciones]: 'status-chip status-chip--orange',
    [EstadoJuradoProyecto.Aprobado]: 'status-chip status-chip--green',
    [EstadoJuradoProyecto.AvalEmitido]: 'status-chip status-chip--blue',
    [EstadoJuradoProyecto.Finalizado]: 'status-chip status-chip--gray',
  };

  openAlert(projectId: number, destination: 'projects' | 'reviews'): void {
    this.jurado.setSelectedProject(projectId);
    this.nav.navigate(destination === 'projects' ? 'projects' : 'reviews');
  }

  openProject(projectId: number): void {
    this.jurado.setSelectedProject(projectId);
    this.nav.navigate('projects');
  }

  roleLabel(role: RolJuradoProyecto): string {
    return this.jurado.getRolLabel(role);
  }

  roleClass(role: RolJuradoProyecto): string {
    return this.roleClassMap[role];
  }

  phaseLabel(phase: 'aprobacion' | 'evaluacion'): string {
    return this.jurado.getPhaseLabel(phase);
  }

  statusLabel(status: EstadoJuradoProyecto): string {
    return this.jurado.getEstadoLabel(status);
  }

  statusClass(status: EstadoJuradoProyecto): string {
    return this.statusClassMap[status];
  }
}
