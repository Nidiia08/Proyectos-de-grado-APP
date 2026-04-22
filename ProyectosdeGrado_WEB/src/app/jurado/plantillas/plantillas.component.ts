import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { JuradoService } from '../jurado.service';

@Component({
  selector: 'app-jurado-plantillas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './plantillas.component.html',
  styleUrl: './plantillas.component.scss',
})
export class PlantillasComponent {
  private readonly jurado = inject(JuradoService);

  readonly search = signal('');
  readonly templates = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.jurado.plantillas().filter((item) => !term || item.nombre.toLowerCase().includes(term));
  });

  download(): void {
    // Mock listo para enlazar con endpoint de Django REST Framework.
  }
}
