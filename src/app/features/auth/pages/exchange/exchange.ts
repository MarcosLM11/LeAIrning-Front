import { Component, signal, inject, OnInit, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-exchange',
  imports: [
    CommonModule,
    RouterLink,
    ThemeToggleComponent
  ],
  templateUrl: './exchange.html',
  styleUrl: './exchange.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Exchange implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  isProcessing = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    // Solo ejecutar en el browser, no en SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.isProcessing.set(false);
      this.errorMessage.set('Código de autorización no proporcionado');
      return;
    }
    this.exchangeCode(code);
  }

  private exchangeCode(code: string): void {
    this.authService.exchangeCodeFromOAuth(code).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.isProcessing.set(false);
        if (err.status === 400 || err.status === 401) {
          this.errorMessage.set('El código de autorización es inválido o ha expirado');
        } else {
          this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
        }
      }
    });
  }
}
