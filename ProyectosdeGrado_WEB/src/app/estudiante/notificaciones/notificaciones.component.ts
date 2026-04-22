import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface NotificacionEstudiante {
  titulo: string;
  fechaRelativa: string;
  leida: boolean;
}

@Component({
  selector: 'app-estudiante-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss',
})
export class NotificacionesComponent {
  readonly notificaciones: NotificacionEstudiante[] = [
    { titulo: 'Su entrega "Avance 2" fue recibida correctamente.', fechaRelativa: 'Hace 1 hora', leida: false },
    { titulo: 'Recordatorio: reunión de seguimiento el viernes 11 abr.', fechaRelativa: 'Ayer', leida: false },
    { titulo: 'El comité publicó el calendario de sustentaciones.', fechaRelativa: '03 abr 2026', leida: true },
  ];

  get noLeidas(): number {
    return this.notificaciones.filter((n) => !n.leida).length;
  }
}
