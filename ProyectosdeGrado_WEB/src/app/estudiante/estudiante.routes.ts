import { Routes } from '@angular/router';

export const ESTUDIANTE_ROUTES: Routes = [
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
    path: 'entregables',
    loadComponent: () => import('./entregables/entregables.component').then((m) => m.EntregablesComponent),
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.component').then((m) => m.ChatComponent),
  },
];
