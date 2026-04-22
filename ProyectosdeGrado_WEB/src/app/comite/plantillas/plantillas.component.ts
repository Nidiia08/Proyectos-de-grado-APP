import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ComiteService } from '../comite.service';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';

@Component({
  selector: 'app-comite-plantillas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './plantillas.component.html',
  styleUrl: './plantillas.component.scss',
})
export class PlantillasComponent {
  readonly comite = inject(ComiteService);
  private readonly dialog = inject(MatDialog);
  readonly search = signal('');
  readonly templates = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.comite.plantillas().filter((item) => !term || item.nombre.toLowerCase().includes(term));
  });
  uploadTemplate(): void {
    this.dialog.open(ConfirmActionDialogComponent, { data: { title: 'Subir nueva plantilla', message: 'Registre el nombre en la observación y se creará una plantilla mock.', confirmText: 'Crear', requireObservation: true } }).afterClosed().subscribe((result) => {
      if (result?.confirmed) this.comite.addTemplate({ nombre: result.observation, categoria: 'General', fase: 'General', modalidadAplica: 'Todas' });
    });
  }
  replaceTemplate(id: number): void { this.comite.replaceTemplate(id); }
  deleteTemplate(id: number): void {
    this.dialog.open(ConfirmActionDialogComponent, { data: { title: 'Eliminar plantilla', message: 'Confirme la eliminación de la plantilla seleccionada.', confirmText: 'Eliminar' } }).afterClosed().subscribe((result) => {
      if (result?.confirmed) this.comite.deleteTemplate(id);
    });
  }
}
