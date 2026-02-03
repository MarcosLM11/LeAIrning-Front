import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto: redirige a /dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Rutas de autenticación (públicas - sin guard)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/pages/login/login')
      .then(m => m.Login)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/pages/register/register')
      .then(m => m.Register)
  },
  {
    path: 'auth/verify',
    loadComponent: () => import('./features/auth/pages/verify/verify')
      .then(m => m.Verify)
  },
  {
    path: 'auth/exchange',
    loadComponent: () => import('./features/auth/pages/exchange/exchange')
      .then(m => m.Exchange)
  },

  // Rutas privadas (CON authGuard)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard')
      .then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'documents',
    loadComponent: () => import('./features/documents/pages/documents/documents')
      .then(m => m.Documents),
    canActivate: [authGuard]
  },
  {
    path: 'documents/upload',
    redirectTo: 'documents',
    pathMatch: 'full'
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/pages/chat/chat')
      .then(m => m.Chat),
    canActivate: [authGuard]
  },
  {
    path: 'quizzes/generate',
    loadComponent: () => import('./features/quizzes/pages/generate/generate')
      .then(m => m.Generate),
    canActivate: [authGuard]
  },

  // Ruta 404: página no encontrada
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
