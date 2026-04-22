import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AsesorService } from '../asesor.service';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';
import { NavigationService } from '../../core/navigation.service';

@Component({
  selector: 'app-asesor-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss',
})
export class NotificacionesComponent {
  readonly asesor = inject(AsesorService);
  private readonly dialog = inject(MatDialog);
  private readonly nav = inject(NavigationService);

  readonly filter = signal<'all' | 'unread' | 'project'>('all');
  readonly projectTerm = signal('');
  readonly unreadCount = this.asesor.noLeidasCount;
  readonly notifications = computed(() => {
    const mode = this.filter();
    const term = this.projectTerm().trim().toLowerCase();

    return this.asesor.notificacionesOrdenadas().filter((item) => {
      if (mode === 'unread' && item.leida) {
        return false;
      }
      if (mode === 'project' && term) {
        return item.proyecto.toLowerCase().includes(term) || item.estudiante.toLowerCase().includes(term);
      }
      if (mode === 'project' && !term) {
        return true;
      }
      return true;
    });
  });

  markAllRead(): void {
    this.dialog
      .open(ConfirmActionDialogComponent, {
        data: {
          title: 'Marcar todas como leídas',
          message: 'Esta acción actualizará el estado de todas las notificaciones del asesor.',
          confirmText: 'Confirmar',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.confirmed) {
          this.asesor.markAllNotificationsRead();
        }
      });
  }

  goToProject(projectId: number, notificationId: number): void {
    this.asesor.setSelectedProject(projectId);
    this.asesor.markNotificationRead(notificationId);
    this.nav.navigate('assigned');
  }
}
