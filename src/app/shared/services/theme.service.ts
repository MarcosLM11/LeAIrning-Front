import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Solo ejecutar en el navegador
    if (this.isBrowser) {
      // Cargar tema del localStorage al inicio
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkMode.set(true);
        document.documentElement.classList.add('dark-theme');
      }

      // Efecto para persistir cambios de tema
      effect(() => {
        if (this.isDarkMode()) {
          document.documentElement.classList.add('dark-theme');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark-theme');
          localStorage.setItem('theme', 'light');
        }
      });
    }
  }

  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
  }
}
