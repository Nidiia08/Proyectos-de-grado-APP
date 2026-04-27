import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComiteService } from '../comite.service';
import { PlantillasService, Plantilla } from '../../shared/plantillas/plantillas.service';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';
import { PlantillaUploadDialogComponent, PlantillaUploadResult } from '../shared/plantilla-upload-dialog.component';

@Component({
  selector: 'app-comite-plantillas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule, MatIconModule, MatSnackBarModule],
  templateUrl: './plantillas.component.html',
  styleUrl: './plantillas.component.scss',
})
export class PlantillasComponent {
  readonly comite = inject(ComiteService);
  private readonly plantillasService = inject(PlantillasService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly search = signal('');
  readonly categoriaFilter = signal<string>('');
  readonly modalidadFilter = signal<string>('');
  readonly plantillas = computed(() => this.plantillasService.plantillas());
  readonly templates = computed(() => {
    let items = this.plantillas();
    const term = this.search().trim().toLowerCase();
    const cat = this.categoriaFilter();
    const modalidad = this.modalidadFilter();
    if (term) items = items.filter((item) => item.nombre.toLowerCase().includes(term));
    if (cat) items = items.filter((item) => item.categoria === cat);
    if (modalidad) items = items.filter((item) => item.modalidad_aplica === modalidad);
    return items;
  });

  constructor() {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.plantillasService.cargar();
  }

  clearFilters(): void {
    this.search.set('');
    this.categoriaFilter.set('');
    this.modalidadFilter.set('');
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
  }

  onCategoriaChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.categoriaFilter.set(value);
  }

  onModalidadChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.modalidadFilter.set(value);
  }

  uploadTemplate(): void {
    this.dialog
      .open(PlantillaUploadDialogComponent, {
        data: {},
        width: 'min(860px, calc(100vw - 2rem))',
        maxWidth: '100vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result: PlantillaUploadResult) => {
      if (result?.success) {
        this.loadTemplates();
      }
    });
  }

  replaceTemplate(template: Plantilla): void {
    this.dialog
      .open(PlantillaUploadDialogComponent, {
        data: { templateId: template.id, nombre: template.nombre, categoria: template.categoria, fase: template.fase, modalidadAplica: template.modalidad_aplica },
        width: 'min(860px, calc(100vw - 2rem))',
        maxWidth: '100vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result: PlantillaUploadResult) => {
        if (result?.success) {
          this.loadTemplates();
        }
      });
  }

  deleteTemplate(id: number): void {
    this.dialog
      .open(ConfirmActionDialogComponent, { data: { title: 'Eliminar plantilla', message: 'Confirme la eliminación de la plantilla seleccionada.', confirmText: 'Eliminar' } })
      .afterClosed()
      .subscribe((result) => {
        if (result?.confirmed) {
          this.plantillasService.eliminar(id).subscribe({
            next: () => {
              this.snackBar.open('Plantilla eliminada correctamente', 'Cerrar', { duration: 3000 });
              this.loadTemplates();
            },
            error: (err) => this.snackBar.open(err.error?.error || 'Error al eliminar la plantilla', 'Cerrar', { duration: 3000 }),
          });
        }
      });
  }

  downloadTemplate(template: Plantilla): void {
    this.plantillasService.descargar(template.id);
  }

  getFormatoBadge(categoria: string): string {
    const badges: Record<string, string> = {
      Estudiante: 'bg-blue-100 text-blue-800',
      Asesor: 'bg-green-100 text-green-800',
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
}