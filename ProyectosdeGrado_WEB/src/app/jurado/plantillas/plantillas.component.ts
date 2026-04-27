import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlantillasService, Plantilla } from '../../shared/plantillas/plantillas.service';

@Component({
  selector: 'app-jurado-plantillas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule],
  templateUrl: './plantillas.component.html',
  styleUrl: './plantillas.component.scss',
})
export class PlantillasComponent implements OnInit {
  private readonly plantillasService = inject(PlantillasService);
  private readonly snackBar = inject(MatSnackBar);

  readonly search = signal('');
  readonly faseFilter = signal<string>('');
  readonly plantillas = computed(() => this.plantillasService.plantillas());
  readonly templates = computed(() => {
    let items = this.plantillas();
    const term = this.search().trim().toLowerCase();
    const fase = this.faseFilter();
    if (term) items = items.filter((item) => item.nombre.toLowerCase().includes(term));
    if (fase) items = items.filter((item) => item.fase === fase);
    return items;
  });

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.plantillasService.cargar('Jurado', undefined, undefined);
  }

  clearFilters(): void {
    this.search.set('');
    this.faseFilter.set('');
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
  }

  onFaseChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.faseFilter.set(value);
  }

  downloadTemplate(template: Plantilla): void {
    this.plantillasService.descargar(template.id);
    this.snackBar.open('Descargando plantilla...', 'Cerrar', { duration: 2000 });
  }

  getFormatoBadge(categoria: string): string {
    const badges: Record<string, string> = {
      Jurado: 'bg-orange-100 text-orange-800',
      General: 'bg-gray-100 text-gray-800',
      Inscripción: 'bg-blue-100 text-blue-800',
      Aprobación: 'bg-yellow-100 text-yellow-800',
      Desarrollo: 'bg-green-100 text-green-800',
      Culminación: 'bg-purple-100 text-purple-800',
      Evaluación: 'bg-orange-100 text-orange-800',
    };
    return badges[categoria] || 'bg-gray-100 text-gray-800';
  }

  getFaseLabel(fase: string): string {
    const labels: Record<string, string> = {
      INSCRIPCION: 'Inscripción',
      APROBACION: 'Aprobación',
      DESARROLLO: 'Desarrollo',
      CULMINACION: 'Culminación',
      EVALUACION: 'Evaluación',
    };
    return labels[fase] || fase;
  }

  getModalidadLabel(modalidad: string): string {
    const labels: Record<string, string> = {
      TODAS: 'Todas las modalidades',
      INVESTIGACION: 'Solo Investigación',
      INTERACCION_SOCIAL: 'Solo Interacción Social',
      PASANTIA: 'Solo Pasantía',
    };
    return labels[modalidad] || modalidad;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}