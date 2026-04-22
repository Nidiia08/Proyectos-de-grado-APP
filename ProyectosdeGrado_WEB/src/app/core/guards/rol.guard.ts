import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RolUsuario } from '../auth.types';

export const rolGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const rolesPermitidos = (route.data?.['roles'] as RolUsuario[] | undefined) ?? [];
  const rolSesion = authService.rolSesion;

  if (!rolSesion || !rolesPermitidos.includes(rolSesion)) {
    void router.navigate(['/no-autorizado']);
    return false;
  }

  return true;
};
