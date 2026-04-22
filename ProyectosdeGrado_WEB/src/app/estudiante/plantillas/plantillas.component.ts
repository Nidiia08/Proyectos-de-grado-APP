import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';

interface PlantillaEstudiante {
  titulo: string;
  descripcion: string;
  formato: string;
}

@Component({
  selector: 'app-estudiante-plantillas',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './plantillas.component.html',
  styleUrl: './plantillas.component.scss',
})
export class PlantillasComponent {
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