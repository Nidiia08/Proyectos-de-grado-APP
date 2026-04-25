import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NavigationService } from '../navigation.service';

export const forcePasswordChangePageGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const navigation = inject(NavigationService);
  const router = inject(Router);

  if (!authService.estaAutenticado) {
    void router.navigate(['/login']);
    return false;
  }

  if (!authService.debeCambiarPassword) {
    navigation.navigateToRoleDashboard(authService.rolSesion);
    return false;
  }

  return true;
};
