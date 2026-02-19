import { Component, signal, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

interface MenuItem {
  label: string; //texto del menu
  icon: string; //Clase del icono
  route: string; //Ruta de navegacion
  badge?: string; //Etiqueta opcional
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private authService = inject(AuthService);

  // Signal para controlar si el sidebar está colapsado (cerrado)
  isCollapsed = signal(true);

  // Output para notificar al padre cuando cambia el estado
  collapsedChange = output<boolean>();

  // Exponer usuario actual del AuthService
  currentUser = this.authService.currentUser;

  // Array de items del menú
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Documents', icon: 'pi pi-file', route: '/documents' },
    { label: 'Chat', icon: 'pi pi-comments', route: '/chat' },
    { label: 'Quizzes', icon: 'pi pi-question-circle', route: '/quizzes/generate' },

  ];

  // Método para alternar el estado del sidebar
  toggleSidebar(): void {
    this.isCollapsed.set(!this.isCollapsed());
    this.collapsedChange.emit(this.isCollapsed());
  }
}
