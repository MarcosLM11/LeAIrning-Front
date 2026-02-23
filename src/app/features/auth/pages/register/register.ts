import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../../core/services/auth';
import { passwordMatchValidator } from '../../../../core/validators/password-match.validator';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';
import { AuthIllustrationComponent } from '../../../../shared/components/auth-illustration/auth-illustration.component';
import { SocialLoginButtons } from '../../../../shared/components/social-login-buttons/social-login-buttons';
import { CommonModule } from '@angular/common';
import { LanguageToggleComponent } from '../../../../shared/components/language-toggle/language-toggle';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ThemeToggleComponent,
    LanguageToggleComponent,
    AuthIllustrationComponent,
    SocialLoginButtons
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class Register implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registerForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showShakeAnimation = signal<boolean>(false);
  currentStep = signal<number>(1);

  // Particles for background animation
  particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10
  }));

  readonly TOTAL_STEPS = 3;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(50)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [passwordMatchValidator('password', 'confirmPassword')]
    });
  }

  nextStep() {
    if (this.currentStep() < this.TOTAL_STEPS) {
      if (this.isCurrentStepValid()) {
        this.currentStep.set(this.currentStep() + 1);
      } else {
        this.markCurrentStepAsTouched();
        this.triggerShakeAnimation();
      }
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 1:
        return this.nameControl?.valid || false;
      case 2:
        return this.emailControl?.valid || false;
      case 3:
        return (this.passwordControl?.valid && this.confirmPasswordControl?.valid && !this.registerForm.errors?.['passwordMismatch']) || false;
      default:
        return false;
    }
  }

  markCurrentStepAsTouched() {
    switch (this.currentStep()) {
      case 1:
        this.nameControl?.markAsTouched();
        break;
      case 2:
        this.emailControl?.markAsTouched();
        break;
      case 3:
        this.passwordControl?.markAsTouched();
        this.confirmPasswordControl?.markAsTouched();
        break;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { name, email, password } = this.registerForm.value;

    this.authService.register({ email, name, role: 'USER', password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.triggerSuccessAnimation();
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);

        if (err.status === 409) {
          this.errorMessage.set('El email ya está registrado');
        } else if (err.status === 400) {
          this.errorMessage.set('Datos inválidos. Verifica los campos.');
        } else {
          this.errorMessage.set('Error al registrarse. Intenta nuevamente.');
        }

        this.triggerShakeAnimation();
      }
    });
  }

  private triggerShakeAnimation() {
    this.showShakeAnimation.set(true);
    setTimeout(() => this.showShakeAnimation.set(false), 650);
  }

  private triggerSuccessAnimation() {
    // TODO: Implement success animation
  }

  get nameControl() {
    return this.registerForm.get('name');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword');
  }
}