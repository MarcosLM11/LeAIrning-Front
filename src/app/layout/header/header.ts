import { Component, signal, inject, HostListener, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/services/auth';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle';
import { DialogService } from '../../shared/services/dialog';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    ButtonModule,
    InputTextModule,
    ThemeToggleComponent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  private elementRef = inject(ElementRef);
  private dialogService = inject(DialogService);

  // Signal to manage the search input value
  searchTerm = signal<string>('');

  // Signal para controlar el menú desplegable
  isMenuOpen = signal(false);

  // Exponer el usuario actual del AuthService
  currentUser = this.authService.currentUser;

  // Cerrar menú al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }

  // Cerrar menú con Escape
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.isMenuOpen.set(false);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  // Method to handle search
  onSearch(): void {
    // TODO: Implement search functionality
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  openProfileDialog(): void {
    this.closeMenu();
    this.dialogService.openProfileDialog();
  }

  goToProfile(): void {
    this.closeMenu();
    // TODO: Implement navigation to profile
  }

  goToSettings(): void {
    this.closeMenu();
    // TODO: Implement navigation to settings
  }

  // Helper para obtener iniciales del nombre
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return user.name.charAt(0).toUpperCase();
  }
}