import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-verify',
  imports: [
    CommonModule,
    RouterLink,
    ThemeToggleComponent
  ],
  templateUrl: './verify.html',
  styleUrl: './verify.scss'
})
export class Verify implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isVerifying = signal(true);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.isVerifying.set(false);
      this.errorMessage.set('Token de verificación no proporcionado');
      return;
    }
    this.verifyEmail(token);
  }

  private verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.isVerifying.set(false);
        this.isSuccess.set(true);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.isVerifying.set(false);
        if (err.status === 400) {
          this.errorMessage.set('El token de verificación es inválido o ha expirado');
        } else {
          this.errorMessage.set('Error al verificar la cuenta. Intenta nuevamente.');
        }
      }
    });
  }
}