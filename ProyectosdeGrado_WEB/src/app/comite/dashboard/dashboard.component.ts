import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NavigationService } from '../../core/navigation.service';
import { ComiteService } from '../comite.service';

declare global {
  interface Window {
    Chart?: any;
  }
}

@Component({
  selector: 'app-comite-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatTableModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
  readonly comite = inject(ComiteService);
  private readonly nav = inject(NavigationService);
  @ViewChild('phaseCanvas') phaseCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('modalityCanvas') modalityCanvas?: ElementRef<HTMLCanvasElement>;
  readonly perfil = this.comite.perfil;
  readonly metrics = this.comite.metrics;
  readonly alertas = this.comite.alerts;
  readonly recent = this.comite.proyectosRecientes;
  readonly displayedColumns = ['estudiantes', 'modalidad', 'fase', 'estado', 'actividad', 'acciones'];
  readonly todayLabel = computed(() =>
    this.comite.formatDate(this.perfil().fechaActual, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  );

  async ngAfterViewInit(): Promise<void> {
    await this.ensureChart();
    this.renderCharts();
  }

  openProject(projectId: number): void {
    this.comite.setSelectedProject(projectId);
    this.nav.navigate('projects');
  }

  viewAll(): void {
    this.nav.navigate('projects');
  }

  private async ensureChart(): Promise<void> {
    if (window.Chart) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Chart.js'));
      document.head.appendChild(script);
    });
  }

  private renderCharts(): void {
    const summary = this.comite.chartSummary();
    if (this.phaseCanvas?.nativeElement) {
      new window.Chart(this.phaseCanvas.nativeElement, {
        type: 'bar',
        data: { labels: summary.fases.labels, datasets: [{ data: summary.fases.data, backgroundColor: '#003087' }] },
        options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false },
      });
    }
    if (this.modalityCanvas?.nativeElement) {
      new window.Chart(this.modalityCanvas.nativeElement, {
        type: 'doughnut',
        data: { labels: summary.modalidades.labels, datasets: [{ data: summary.modalidades.data, backgroundColor: ['#003087', '#1D9E75', '#4f7fd6', '#7ed0b8'] }] },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }
}
