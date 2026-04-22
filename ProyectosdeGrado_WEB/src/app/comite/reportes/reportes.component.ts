import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ComiteService } from '../comite.service';

declare global { interface Window { Chart?: any; } }

@Component({
  selector: 'app-comite-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements AfterViewInit {
  readonly comite = inject(ComiteService);
  @ViewChildren('chartCanvas') canvases?: QueryList<ElementRef<HTMLCanvasElement>>;

  async ngAfterViewInit(): Promise<void> {
    await this.ensureChart();
    this.renderCharts();
  }

  exportMock(kind: string): void {
    console.log(`Exportación mock: ${kind}`);
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
    const nodes = this.canvases?.toArray() ?? [];
    const summary = this.comite.chartSummary();
    nodes.forEach((item, index) => {
      const type = index % 2 === 0 ? 'bar' : 'doughnut';
      const labels = index % 2 === 0 ? summary.fases.labels : summary.modalidades.labels;
      const data = index % 2 === 0 ? summary.fases.data : summary.modalidades.data;
      new window.Chart(item.nativeElement, {
        type,
        data: { labels, datasets: [{ data, backgroundColor: ['#003087', '#1D9E75', '#4f7fd6', '#7ed0b8', '#8c9ab0', '#d1d5db'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: type !== 'bar' } } },
      });
    });
  }
}
