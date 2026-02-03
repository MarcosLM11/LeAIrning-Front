import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../../core/services/auth';
import { DialogService } from '../../services/dialog';

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  label: string;
  class: string;
  percentage: number;
}

@Component({
  selector: 'app-profile-edit-dialog',
  imports: [FormsModule, DialogModule],
  templateUrl: './profile-edit-dialog.html',
  styleUrl: './profile-edit-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditDialog {
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);

  // Visibility from service
  visible = this.dialogService.profileDialogVisible;

  // Estado del formulario
  currentUser = this.authService.currentUser;
  isLoading = signal(false);
  activeSection = signal<'profile' | 'password'>('profile');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Password visibility toggles
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // Datos del formulario
  formData = signal<ProfileFormData>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Imagen de perfil
  profileImagePreview = signal<string | null>(null);

  onDialogShow(): void {
    const user = this.currentUser();
    if (user) {
      this.formData.set({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  onDialogHide(): void {
    this.dialogService.closeProfileDialog();
    this.resetForm();
  }

  closeDialog(): void {
    this.dialogService.closeProfileDialog();
  }

  setActiveSection(section: 'profile' | 'password'): void {
    this.activeSection.set(section);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  updateFormField(field: keyof ProfileFormData, value: string): void {
    this.formData.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.profileImagePreview.set(null);
  }

  getPasswordStrength(): PasswordStrength {
    const password = this.formData().newPassword;

    if (!password) {
      return { label: '', class: '', percentage: 0 };
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;

    // Has lowercase
    if (/[a-z]/.test(password)) score += 15;

    // Has uppercase
    if (/[A-Z]/.test(password)) score += 15;

    // Has number
    if (/\d/.test(password)) score += 15;

    // Has special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    if (score < 30) {
      return { label: 'Muy débil', class: 'weak', percentage: score };
    } else if (score < 50) {
      return { label: 'Débil', class: 'fair', percentage: score };
    } else if (score < 70) {
      return { label: 'Aceptable', class: 'good', percentage: score };
    } else if (score < 90) {
      return { label: 'Fuerte', class: 'strong', percentage: score };
    } else {
      return { label: 'Muy fuerte', class: 'very-strong', percentage: 100 };
    }
  }

  async saveProfile(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // TODO: Implementar llamada al API para actualizar perfil
      // await this.authService.updateProfile(this.formData());

      // Simulación de éxito
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.successMessage.set('Perfil actualizado correctamente');

      // Cerrar el dialog después de 1.5 segundos
      setTimeout(() => {
        this.closeDialog();
      }, 1500);
    } catch {
      this.errorMessage.set('Error al actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async changePassword(): Promise<void> {
    const data = this.formData();

    // Validaciones
    if (!data.currentPassword) {
      this.errorMessage.set('Ingresa tu contraseña actual');
      return;
    }

    if (!data.newPassword) {
      this.errorMessage.set('Ingresa la nueva contraseña');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }

    if (data.newPassword.length < 8) {
      this.errorMessage.set('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // TODO: Implementar llamada al API para cambiar contraseña
      // await this.authService.changePassword(data.currentPassword, data.newPassword);

      // Simulación de éxito
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.successMessage.set('Contraseña actualizada correctamente');

      // Limpiar campos de contraseña
      this.formData.update((current) => ({
        ...current,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch {
      this.errorMessage.set('Error al cambiar la contraseña. Verifica tu contraseña actual.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private resetForm(): void {
    this.formData.set({
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    this.profileImagePreview.set(null);
    this.activeSection.set('profile');
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return user.name.charAt(0).toUpperCase();
  }
}
