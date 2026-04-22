import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NavigationService } from '../../core/navigation.service';
import { JuradoService } from '../jurado.service';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';

@Component({
  selector: 'app-jurado-notificaciones',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatButtonToggleModule, MatCardModule, MatChipsModule, MatIconModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss',
})
export class NotificacionesComponent {
  readonly jurado = inject(JuradoService);
  private readonly nav = inject(NavigationService);
  private readonly dialog = inject(MatDialog);

  readonly filter = signal<'all' | 'unread' | 'reviewer' | 'evaluator'>('all');
  readonly unreadCount = this.jurado.unreadCount;
  readonly notifications = computed(() => {
    const mode = this.filter();
    return this.jurado.notificaciones().filter((item) => {
      if (mode === 'unread') return !item.leida;
      if (mode === 'reviewer') return item.comoRol === 'revisor';
      if (mode === 'evaluator') return item.comoRol === 'evaluador';
      return true;
    });
  });

  markAllRead(): void {
    this.dialog
      .open(ConfirmActionDialogComponent, {
        data: {
          title: 'Marcar todas como leídas',
          message: 'Se actualizará el estado de todas las notificaciones del jurado.',
          confirmText: 'Confirmar',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.confirmed) this.jurado.markAllNotificationsRead();
      });
  }

  goToProject(projectId: number, notificationId: number): void {
    this.jurado.setSelectedProject(projectId);
    this.jurado.markNotificationRead(notificationId);
    this.nav.navigate('projects');
  }
}
