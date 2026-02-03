import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    ButtonModule,
    AvatarModule,
    InputTextModule,
    MenuModule,
    ThemeToggleComponent
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);

  // Signal to manage the search input value
  searchTerm = signal<string>('');

  // Exponer el usuario actual del AuthService
  currentUser = this.authService.currentUser;

  // Menú del avatar
  userMenuItems: MenuItem[] = [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      command: () => this.goToProfile()
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.goToSettings()
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  // Method to handle search
  onSearch(): void {
    console.log('Buscando:', this.searchTerm());
    // TODO: Implement search functionality
  }

  logout(): void {
    this.authService.logout();
  }

  goToProfile(): void {
    console.log('Ir a perfil');
    // TODO: Implementar navegación a perfil
  }

  goToSettings(): void {
    console.log('Ir a configuración');
    // TODO: Implementar navegación a configuración
  }

  // Helper para obtener iniciales del nombre
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return user.name.charAt(0).toUpperCase();
  }
}