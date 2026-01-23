import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Guard funcional que protege rutas privadas
 * Solo permite acceso si el usuario está autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    // Si hay token pero está expirado, hacer logout
    if (authService.isTokenExpired()) {
      authService.logout();
      return false;
    }
    return true; // Permitir acceso
  }

  // No está autenticado, redirigir a login
  // Guardar la URL a la que intentaba acceder para redirigir después del login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false; // Bloquear acceso
};