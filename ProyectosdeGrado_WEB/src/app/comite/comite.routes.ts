import { Routes } from '@angular/router';

export const COMITE_ROUTES: Routes = [
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
    path: 'proyectos',
    loadComponent: () => import('./proyectos/proyectos.component').then((m) => m.ProyectosComponent),
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
    path: 'reportes',
    loadComponent: () => import('./reportes/reportes.component').then((m) => m.ReportesComponent),
  },
  {
    path: 'administracion',
    loadComponent: () => import('./administracion/administracion.component').then((m) => m.AdministracionComponent),
  },
];
