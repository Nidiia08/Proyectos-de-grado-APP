import { Routes } from '@angular/router';

export const ASESOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'perfil',
    loadComponent: () => import('../shared/perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  {
    path: 'plantillas',
    loadComponent: () => import('./plantillas/plantillas.component').then((m) => m.PlantillasComponent),
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./notificaciones/notificaciones.component').then((m) => m.NotificacionesComponent),
  },
  {
    path: 'assigned',
    loadComponent: () => import('./proyectos/proyectos.component').then((m) => m.ProyectosComponent),
  },
  {
    path: 'revisiones',
    loadComponent: () => import('./revisiones/revisiones.component').then((m) => m.RevisionesComponent),
  },
  {
    path: 'chat',
    loadComponent: () => import('../estudiante/chat/chat.component').then((m) => m.ChatComponent),
  },
];
