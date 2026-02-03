import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../../core/services/auth';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';
import { AuthIllustrationComponent } from '../../../../shared/components/auth-illustration/auth-illustration.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ThemeToggleComponent,
    AuthIllustrationComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private returnUrl: string = '/dashboard';

  loginForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showShakeAnimation = signal<boolean>(false);
  rememberMe = false;

  // Particles for background animation
  particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10
  }));

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }
    this.returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/dashboard';
    this.initializeForm();
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Success animation here (could trigger confetti)
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        
        if (err.status === 401) {
          this.errorMessage.set('Correo o contraseña incorrectos');
        } else {
          this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
        }
        this.triggerShakeAnimation();
      }
    });
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  loginWithGithub() {
    console.log('Login with GitHub'); //TODO: Implement
  }

  private triggerShakeAnimation() {
    this.showShakeAnimation.set(true);
    setTimeout(() => this.showShakeAnimation.set(false), 650);
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}