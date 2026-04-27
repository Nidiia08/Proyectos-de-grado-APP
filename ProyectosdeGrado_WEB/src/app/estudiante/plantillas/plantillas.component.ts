import { CommonModule, NgClass } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface PlantillaEstudiante {
  titulo: string;
  descripcion: string;
  formato: string;
}

@Component({
  selector: 'app-estudiante-plantillas',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule, MatCardModule, MatIconModule],
  templateUrl: './plantillas.component.html',
  styleUrl: './plantillas.component.scss',
})
export class PlantillasComponent {
  readonly search = signal('');

  readonly plantillas: PlantillaEstudiante[] = [
    {
      titulo: 'Propuesta de trabajo de grado',
      descripcion: 'Estructura oficial para presentación ante el comité.',
      formato: 'DOCX / LaTeX',
    },
    {
      titulo: 'Informe de avance',
      descripcion: 'Formato trimestral con bitácora y resultados parciales.',
      formato: 'DOCX',
    },
    {
      titulo: 'Documento final',
      descripcion: 'Plantilla para el informe final y anexos del proyecto.',
      formato: 'DOCX',
    },
    {
      titulo: 'Diapositivas de sustentación',
      descripcion: 'Guía de secciones y tiempos sugeridos para la presentación.',
      formato: 'PPTX',
    },
  ];

  readonly filteredPlantillas = computed(() => {
    const term = this.search().toLowerCase();
    return this.plantillas.filter(p => 
      !term || p.titulo.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term)
    );
  });

  getIconEmoji(formato: string): string {
    if (formato.includes('PPTX')) return '🗂️';
    if (formato.includes('LaTeX')) return '📄';
    return '📋';
  }

  getIconBg(formato: string): string {
    if (formato.includes('PPTX')) return 'bg-orange-50';
    if (formato.includes('LaTeX')) return 'bg-green-50';
    return 'bg-blue-50';
  }

  getFormatoBadge(formato: string): string {
    if (formato.includes('PPTX')) return 'bg-orange-100 text-orange-800';
    if (formato.includes('LaTeX')) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  }
}