import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { forcePasswordChangePageGuard } from './core/guards/force-password-change-page.guard';
import { passwordChangeRequiredGuard } from './core/guards/password-change-required.guard';
import { rolGuard } from './core/guards/rol.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cambiar-password',
    canActivate: [forcePasswordChangePageGuard],
    loadComponent: () =>
      import('./features/cambiar-password/cambiar-password.component').then((m) => m.CambiarPasswordComponent),
  },
  {
    path: 'estudiante',
    canActivate: [authGuard, passwordChangeRequiredGuard, rolGuard],
    data: { roles: ['ESTUDIANTE'] },
    loadChildren: () => import('./estudiante/estudiante.routes').then((m) => m.ESTUDIANTE_ROUTES),
  },
  {
    path: 'asesor',
    canActivate: [authGuard, passwordChangeRequiredGuard, rolGuard],
    data: { roles: ['DOCENTE'] },
    loadChildren: () => import('./asesor/asesor.routes').then((m) => m.ASESOR_ROUTES),
  },
  {
    path: 'jurado',
    canActivate: [authGuard, passwordChangeRequiredGuard, rolGuard],
    data: { roles: ['JURADO'] },
    loadChildren: () => import('./jurado/jurado.routes').then((m) => m.JURADO_ROUTES),
  },
  {
    path: 'comite',
    canActivate: [authGuard, passwordChangeRequiredGuard, rolGuard],
    data: { roles: ['COMITE'] },
    loadChildren: () => import('./comite/comite.routes').then((m) => m.COMITE_ROUTES),
  },
  {
    path: 'no-autorizado',
    loadComponent: () =>
      import('./shared/no-autorizado/no-autorizado.component').then((m) => m.NoAutorizadoComponent),
  },
  { path: '**', redirectTo: 'login' },
];
