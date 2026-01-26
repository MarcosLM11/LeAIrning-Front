import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  // Signal para controlar si el sidebar está colapsado (cerrado)
  isCollapsed = signal(false);

  // Array de items del menú
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Documents', icon: 'pi pi-file', route: '/documents' },
    { label: 'Chat', icon: 'pi pi-comments', route: '/chat', badge: '2' },
    { label: 'Summaries', icon: 'pi pi-book', route: '/summaries' },
    { label: 'Podcasts', icon: 'pi pi-microphone', route: '/podcasts' },
    { label: 'Quizzes', icon: 'pi pi-question-circle', route: '/quizzes/generate' },
    { label: 'Search', icon: 'pi pi-search', route: '/search' },
  ];

  // Método para alternar el estado del sidebar
  toggleSidebar(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
