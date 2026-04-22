import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NavigationService } from '../../core/navigation.service';
import { ComiteService } from '../comite.service';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';

@Component({
  selector: 'app-comite-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss',
})
export class NotificacionesComponent {
  readonly comite = inject(ComiteService);
  private readonly nav = inject(NavigationService);
  private readonly dialog = inject(MatDialog);
  readonly unreadCount = this.comite.unreadCount;
  readonly phaseFilter = signal('todas');
  readonly modalityFilter = signal('todas');
  readonly projectFilter = signal('');
  readonly mode = signal<'all' | 'unread'>('all');
  readonly notifications = computed(() => {
    const term = this.projectFilter().trim().toLowerCase();
    return this.comite.notificaciones().filter((item) => {
      const unread = this.mode() === 'all' || !item.leida;
      const phase = this.phaseFilter() === 'todas' || item.fase === this.phaseFilter();
      const modality = this.modalityFilter() === 'todas' || item.modalidad === this.modalityFilter();
      const project = !term || item.proyecto.toLowerCase().includes(term) || item.estudiante.toLowerCase().includes(term);
      return unread && phase && modality && project;
    });
  });
  markAllRead(): void {
    this.dialog.open(ConfirmActionDialogComponent, { data: { title: 'Marcar todas como leídas', message: 'Se actualizará el estado de todas las notificaciones del comité.', confirmText: 'Confirmar' } }).afterClosed().subscribe((result) => {
      if (result?.confirmed) this.comite.markAllNotificationsRead();
    });
  }
  goToProject(projectId: number, notificationId: number): void {
    this.comite.setSelectedProject(projectId);
    this.comite.markNotificationRead(notificationId);
    this.nav.navigate('projects');
  }
}
