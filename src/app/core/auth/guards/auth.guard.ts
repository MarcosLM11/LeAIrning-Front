import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Guard funcional que protege rutas privadas
 * Solo permite acceso si el usuario está autenticado
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    if (authService.isTokenExpired()) {
      authService.logout();
      return router.createUrlTree(['/auth/login']);
    }
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};