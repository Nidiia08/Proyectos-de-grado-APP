import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AsesorService, EstadoProyectoAsesor } from '../asesor.service';
import { NavigationService } from '../../core/navigation.service';

@Component({
  selector: 'app-asesor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly asesor = inject(AsesorService);
  private readonly nav = inject(NavigationService);

  readonly docente = this.asesor.docenteActual;
  readonly metrics = this.asesor.dashboardMetrics;
  readonly alertas = this.asesor.alertas;
  readonly displayedColumns = ['estudiantes', 'modalidad', 'fase', 'estado', 'acciones'];
  readonly rows = this.asesor.proyectosAsignados;
  readonly todayLabel = computed(() =>
    this.asesor.formatDate(this.docente().fechaActual, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  readonly statusClassMap: Record<EstadoProyectoAsesor, string> = {
    [EstadoProyectoAsesor.EnCurso]: 'status-chip status-chip--green',
    [EstadoProyectoAsesor.PendienteAccionAsesor]: 'status-chip status-chip--yellow',
    [EstadoProyectoAsesor.ConObservaciones]: 'status-chip status-chip--orange',
    [EstadoProyectoAsesor.Finalizado]: 'status-chip status-chip--gray',
  };

  goToAlert(projectId: number, destination: 'proyectos' | 'revisiones'): void {
    this.asesor.setSelectedProject(projectId);
    this.nav.navigate(destination === 'proyectos' ? 'assigned' : 'reviews');
  }

  goToProject(projectId: number): void {
    this.asesor.setSelectedProject(projectId);
    this.nav.navigate('assigned');
  }

  phaseLabel(value: string): string {
    return this.asesor.getPhaseLabel(value as never);
  }

  statusLabel(status: EstadoProyectoAsesor): string {
    return this.asesor.getEstadoLabel(status);
  }

  statusClass(status: EstadoProyectoAsesor): string {
    return this.statusClassMap[status];
  }
}
