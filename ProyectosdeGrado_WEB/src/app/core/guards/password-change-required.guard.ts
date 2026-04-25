import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const passwordChangeRequiredGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.debeCambiarPassword) {
    void router.navigate(['/cambiar-password']);
    return false;
  }

  return true;
};
