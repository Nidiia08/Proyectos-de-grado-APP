import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

const AUTH_ENDPOINTS = ['/auth/login/', '/auth/refresh/', '/auth/logout/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.accessToken;
  const isAuthRequest = AUTH_ENDPOINTS.some((endpoint) => req.url.includes(endpoint));

  let request = req;
  if (token && !isAuthRequest) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401 && !isAuthRequest) {
        return authService.refrescarToken().pipe(
          switchMap((nuevoToken) => {
            const retryRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${nuevoToken}`,
              },
            });
            return next(retryRequest);
          }),
          catchError(() =>
            authService.logout().pipe(
              switchMap(() => {
                void router.navigate(['/login']);
                return throwError(() => error);
              }),
            ),
          ),
        );
      }

      return throwError(() => error);
    }),
  );
};
