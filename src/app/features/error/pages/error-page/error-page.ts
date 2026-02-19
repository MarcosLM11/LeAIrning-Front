import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { errorPageAnimations } from './error-page.animations';

type ErrorType = '404' | '500' | 'generic';

@Component({
  selector: 'app-error-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
  animations: errorPageAnimations
})
export class ErrorPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  errorType = signal<ErrorType>('generic');

  errorCode = computed(() => {
    switch (this.errorType()) {
      case '404': return '404';
      case '500': return '500';
      default: return 'Oops';
    }
  });

  title = computed(() => {
    switch (this.errorType()) {
      case '404': return 'Página no encontrada';
      case '500': return 'Error del servidor';
      default: return 'Algo salió mal';
    }
  });

  subtitle = computed(() => {
    switch (this.errorType()) {
      case '404': return 'Parece que te has perdido en el espacio. La página que buscas no existe.';
      case '500': return 'Nuestros servidores están teniendo problemas. Estamos trabajando para solucionarlo.';
      default: return 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';
    }
  });

  particles = Array.from({ length: 15 }, () => ({
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 3 + Math.random() * 4
  }));

  stars = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    delay: Math.random() * 3
  }));

  constructor() {
    var data = this.route.snapshot.data;
    if (data['errorType']) {
      this.errorType.set(data['errorType']);
    }
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    this.location.back();
  }
}
