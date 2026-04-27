import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface NotificacionEstudiante {
  titulo: string;
  fechaRelativa: string;
  leida: boolean;
}

@Component({
  selector: 'app-estudiante-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss',
})
export class NotificacionesComponent {
  readonly search = signal('');

  readonly notificaciones: NotificacionEstudiante[] = [
    { titulo: 'Su entrega "Avance 2" fue recibida correctamente.', fechaRelativa: 'Hace 1 hora', leida: false },
    { titulo: 'Recordatorio: reunión de seguimiento el viernes 11 abr.', fechaRelativa: 'Ayer', leida: false },
    { titulo: 'El comité publicó el calendario de sustentaciones.', fechaRelativa: '03 abr 2026', leida: true },
  ];

  readonly filteredNotificaciones = computed(() => {
    const term = this.search().toLowerCase();
    return this.notificaciones.filter(n => 
      !term || n.titulo.toLowerCase().includes(term)
    );
  });

  get noLeidas(): number {
    return this.filteredNotificaciones().filter((n) => !n.leida).length;
  }
}
