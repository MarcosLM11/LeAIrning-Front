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
import { CommonModule } from '@angular/common';

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
    AuthIllustrationComponent
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
    // Si ya está logueado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(20)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.maxLength(50)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [passwordMatchValidator('password', 'confirmPassword')]
    });
  }

  nextStep() {
    if (this.currentStep() < this.TOTAL_STEPS) {
      // Validate current step
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
        return this.usernameControl?.valid || false;
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
        this.usernameControl?.markAsTouched();
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

    // Preparar datos para el backend (sin confirmPassword)
    const { username, email, password } = this.registerForm.value;

    this.authService.register({ username, email, password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Trigger success animation (confetti)
        this.triggerSuccessAnimation();
        
        // Redirect to login after animation
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error en registro:', err);
        
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

  registerWithGoogle() {
    // TODO: Implement Google OAuth
    console.log('Register with Google');
  }

  registerWithGithub() {
    // TODO: Implement GitHub OAuth
    console.log('Register with GitHub');
  }

  private triggerShakeAnimation() {
    this.showShakeAnimation.set(true);
    setTimeout(() => this.showShakeAnimation.set(false), 650);
  }

  private triggerSuccessAnimation() {
    // TODO: Trigger confetti animation
    console.log('Success! 🎉');
  }

  // Getters para acceder a los controles
  get usernameControl() {
    return this.registerForm.get('username');
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