import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ChildrenOutletContexts } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { ProfileEditDialog } from './shared/components/profile-edit-dialog/profile-edit-dialog';
import { ProfileViewDialog } from './shared/components/profile-view-dialog/profile-view-dialog';
import { fadeScaleAnimation } from './shared/animations/route-animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, ProfileEditDialog, ProfileViewDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [fadeScaleAnimation]
})
export class App {
  // Signal para controlar si mostramos el layout o no
  showLayout = signal<boolean>(true);

  // Signal para el estado colapsado del sidebar
  sidebarCollapsed = signal<boolean>(true);

  constructor(
    private router: Router,
    private contexts: ChildrenOutletContexts
  ) {
    // Inicializar el estado del layout basado en la URL actual
    const currentUrl = this.router.url;
    const isAuthRoute = currentUrl.includes('/auth/');
    this.showLayout.set(!isAuthRoute);

    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Ocultar layout en rutas de autenticación
        const isAuthRoute = event.url.includes('/auth/');
        this.showLayout.set(!isAuthRoute);
      });
  }

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }

  // Helper para las animaciones de ruta
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}