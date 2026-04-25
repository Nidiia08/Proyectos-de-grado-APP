import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService, UserRole } from './auth.service';
import { RolUsuario } from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly currentView = signal('dashboard');

  constructor() {
    this.actualizarVistaActual(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.actualizarVistaActual(event.urlAfterRedirects));
  }

  navigate(view: string): void {
    const destino = this.resolverRutaPorVista(this.auth.userRole(), view);
    this.currentView.set(view);
    void this.router.navigateByUrl(destino);
  }

  navigateToRoleDashboard(role: RolUsuario | UserRole | null): void {
    const mappedRole = this.normalizarRol(role);
    const destino = this.resolverRutaPorVista(mappedRole, 'dashboard');
    this.currentView.set('dashboard');
    void this.router.navigateByUrl(destino);
  }

  navigateToLogin(): void {
    this.currentView.set('login');
    void this.router.navigate(['/login']);
  }

  private actualizarVistaActual(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const segmentos = cleanUrl.split('/').filter(Boolean);
    const ultimoSegmento = segmentos[segmentos.length - 1] ?? 'login';
    const vistaPorSegmento: Record<string, string> = {
      login: 'login',
      dashboard: 'dashboard',
        perfil: 'perfil',
      plantillas: 'templates',
      notificaciones: 'notifications',
      entregables: 'deliverables',
      chat: 'chat',
      assigned: 'assigned',
      proyectos: 'projects',
      revisiones: 'reviews',
      reportes: 'reports',
      administracion: 'administration',
      'cambiar-password': 'change-password',
      'no-autorizado': 'no-autorizado',
    };

    this.currentView.set(vistaPorSegmento[ultimoSegmento] ?? ultimoSegmento);
  }

  private resolverRutaPorVista(role: UserRole | '', view: string): string {
    if (view === 'change-password') {
      return '/cambiar-password';
    }

    const rutasPorRol: Record<UserRole, Record<string, string>> = {
      student: {
        dashboard: '/estudiante/dashboard',
        perfil: '/estudiante/perfil',
        templates: '/estudiante/plantillas',
        notifications: '/estudiante/notificaciones',
        deliverables: '/estudiante/entregables',
        chat: '/estudiante/chat',
      },
      professor: {
        dashboard: '/asesor/dashboard',
        perfil: '/asesor/perfil',
        templates: '/asesor/plantillas',
        notifications: '/asesor/notificaciones',
        assigned: '/asesor/assigned',
        reviews: '/asesor/revisiones',
        chat: '/asesor/chat',
      },
      jury: {
        dashboard: '/jurado/dashboard',
        perfil: '/jurado/perfil',
        projects: '/jurado/proyectos',
        templates: '/jurado/plantillas',
        notifications: '/jurado/notificaciones',
        reviews: '/jurado/revisiones',
        chat: '/jurado/chat',
      },
      committee: {
        dashboard: '/comite/dashboard',
        perfil: '/comite/perfil',
        projects: '/comite/proyectos',
        templates: '/comite/plantillas',
        notifications: '/comite/notificaciones',
        reports: '/comite/reportes',
        administration: '/comite/administracion',
      },
    };

    if (!role) {
      return '/login';
    }

    return rutasPorRol[role][view] ?? rutasPorRol[role]['dashboard'];
  }

  private normalizarRol(role: RolUsuario | UserRole | null): UserRole | '' {
    switch (role) {
      case 'ESTUDIANTE':
      case 'student':
        return 'student';
      case 'DOCENTE':
      case 'professor':
        return 'professor';
      case 'JURADO':
      case 'jury':
        return 'jury';
      case 'COMITE':
      case 'committee':
        return 'committee';
      default:
        return '';
    }
  }
}
