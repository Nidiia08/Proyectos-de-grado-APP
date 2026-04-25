import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { AsesorService } from '../../asesor/asesor.service';
import { ComiteService } from '../../comite/comite.service';
import { AuthService } from '../../core/auth.service';
import { NavigationService } from '../../core/navigation.service';
import { JuradoService } from '../../jurado/jurado.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatBadgeModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly nav = inject(NavigationService);
  private readonly asesor = inject(AsesorService);
  private readonly jurado = inject(JuradoService);
  private readonly comite = inject(ComiteService);

  readonly role = this.auth.userRole;
  readonly currentView = this.nav.currentView;
  readonly unreadAdvisorNotifications = this.asesor.noLeidasCount;
  readonly unreadJuryNotifications = this.jurado.unreadCount;
  readonly unreadCommitteeNotifications = this.comite.unreadCount;

  menuItems(): MenuItem[] {
    const role = this.role();

    if (role === 'student') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'D' },
        { id: 'perfil', label: 'Mi perfil', icon: '👤' },
        { id: 'templates', label: 'Plantillas', icon: 'P' },
        { id: 'notifications', label: 'Notificaciones', icon: 'N' },
        { id: 'deliverables', label: 'Entregables', icon: 'E' },
        { id: 'chat', label: 'Chat', icon: 'C' },
      ];
    }

    if (role === 'jury') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'D' },
        { id: 'perfil', label: 'Mi perfil', icon: '👤' },
        { id: 'projects', label: 'Proyectos', icon: 'PR' },
        { id: 'templates', label: 'Plantillas', icon: 'P' },
        { id: 'notifications', label: 'Notificaciones', icon: 'N' },
        { id: 'reviews', label: 'Revisiones', icon: 'RV' },
        { id: 'chat', label: 'Chat', icon: 'C' },
      ];
    }

    const commonByRole: Record<string, MenuItem[]> = {
      professor: [
        { id: 'dashboard', label: 'Dashboard', icon: 'D' },
        { id: 'perfil', label: 'Mi perfil', icon: '👤' },
        { id: 'templates', label: 'Plantillas', icon: 'P' },
        { id: 'notifications', label: 'Notificaciones', icon: 'N' },
      ],
      committee: [
        { id: 'dashboard', label: 'Dashboard', icon: 'D' },
        { id: 'perfil', label: 'Mi perfil', icon: '👤' },
        { id: 'projects', label: 'Proyectos', icon: 'PR' },
        { id: 'templates', label: 'Plantillas', icon: 'P' },
        { id: 'notifications', label: 'Notificaciones', icon: 'N' },
        { id: 'reports', label: 'Reportes', icon: 'R' },
        { id: 'administration', label: 'Administración', icon: 'A' },
      ],
    };

    const roleSpecific: Record<string, MenuItem[]> = {
      professor: [
        { id: 'assigned', label: 'Proyectos Asignados', icon: 'PA' },
        { id: 'reviews', label: 'Revisiones', icon: 'RV' },
        { id: 'chat', label: 'Chat', icon: 'C' },
      ],
      committee: [],
    };

    return [...(commonByRole[role] ?? []), ...(roleSpecific[role] ?? [])];
  }

  roleName(): string {
    const names: Record<string, string> = {
      student: 'Estudiante',
      professor: 'Docente Director',
      jury: 'Jurado Evaluador',
      committee: 'Comité Curricular',
    };
    return names[this.role()] ?? 'Usuario';
  }

  selectView(id: string): void {
    this.nav.navigate(id);
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.nav.navigateToLogin());
  }

  showUnreadBadge(id: string): boolean {
    if (id !== 'notifications') return false;
    if (this.role() === 'professor') return this.unreadAdvisorNotifications() > 0;
    if (this.role() === 'jury') return this.unreadJuryNotifications() > 0;
    if (this.role() === 'committee') return this.unreadCommitteeNotifications() > 0;
    return false;
  }

  unreadBadgeValue(id: string): number | null {
    if (!this.showUnreadBadge(id)) return null;
    if (this.role() === 'professor') return this.unreadAdvisorNotifications();
    if (this.role() === 'jury') return this.unreadJuryNotifications();
    if (this.role() === 'committee') return this.unreadCommitteeNotifications();
    return null;
  }
}
