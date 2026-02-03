import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ProfileEditDialog } from './profile-edit-dialog';
import { AuthService } from '../../../core/services/auth';
import { DialogService } from '../../services/dialog';
import { User } from '../../../core/models/auth.model';

describe('ProfileEditDialog', () => {
  let component: ProfileEditDialog;
  let fixture: ComponentFixture<ProfileEditDialog>;
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
  };
  let mockDialogService: {
    profileDialogVisible: ReturnType<typeof signal<boolean>>;
    openProfileDialog: ReturnType<typeof vi.fn>;
    closeProfileDialog: ReturnType<typeof vi.fn>;
  };

  const mockUser: User = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockAuthService = {
      currentUser: signal<User | null>(mockUser),
    };

    mockDialogService = {
      profileDialogVisible: signal(false),
      openProfileDialog: vi.fn(),
      closeProfileDialog: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileEditDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideAnimations(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: DialogService, useValue: mockDialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form data on dialog show', () => {
    component.onDialogShow();

    const formData = component.formData();
    expect(formData.name).toBe('Test User');
    expect(formData.email).toBe('test@example.com');
  });

  it('should have profile and password sections', () => {
    expect(component.activeSection()).toBe('profile');

    component.setActiveSection('password');
    expect(component.activeSection()).toBe('password');
  });

  it('should update form field correctly', () => {
    component.updateFormField('name', 'New Name');

    expect(component.formData().name).toBe('New Name');
  });

  it('should validate password match', async () => {
    component.setActiveSection('password');
    component.updateFormField('currentPassword', 'oldpassword');
    component.updateFormField('newPassword', 'newpassword123');
    component.updateFormField('confirmPassword', 'differentpassword');

    await component.changePassword();

    expect(component.errorMessage()).toBe('Las contraseñas no coinciden');
  });

  it('should validate password length', async () => {
    component.setActiveSection('password');
    component.updateFormField('currentPassword', 'oldpassword');
    component.updateFormField('newPassword', 'short');
    component.updateFormField('confirmPassword', 'short');

    await component.changePassword();

    expect(component.errorMessage()).toBe('La contraseña debe tener al menos 8 caracteres');
  });

  it('should call dialogService.closeProfileDialog on dialog hide', () => {
    component.onDialogHide();

    expect(mockDialogService.closeProfileDialog).toHaveBeenCalled();
  });

  it('should get user initials correctly', () => {
    expect(component.getUserInitials()).toBe('T');
  });

  it('should return ? when no user', () => {
    mockAuthService.currentUser.set(null);
    fixture.detectChanges();

    expect(component.getUserInitials()).toBe('?');
  });

  it('should clear error message when switching sections', () => {
    component.errorMessage.set('Some error');

    component.setActiveSection('password');

    expect(component.errorMessage()).toBeNull();
  });

  describe('getPasswordStrength', () => {
    it('should return empty strength when no password', () => {
      component.updateFormField('newPassword', '');

      const strength = component.getPasswordStrength();

      expect(strength.label).toBe('');
      expect(strength.class).toBe('');
      expect(strength.percentage).toBe(0);
    });

    it('should return "Muy débil" for short password', () => {
      component.updateFormField('newPassword', 'abc');

      const strength = component.getPasswordStrength();

      expect(strength.label).toBe('Muy débil');
      expect(strength.class).toBe('weak');
      expect(strength.percentage).toBeLessThan(30);
    });

    it('should return "Débil" for password with only lowercase and length >= 8', () => {
      component.updateFormField('newPassword', 'abcdefgh');

      const strength = component.getPasswordStrength();

      expect(strength.label).toBe('Débil');
      expect(strength.class).toBe('fair');
    });

    it('should return "Aceptable" for password with lowercase, uppercase, and length >= 8', () => {
      component.updateFormField('newPassword', 'Abcdefgh');

      const strength = component.getPasswordStrength();

      expect(strength.label).toBe('Aceptable');
      expect(strength.class).toBe('good');
    });

    it('should return "Fuerte" for password with lowercase, uppercase, number, and length >= 8', () => {
      component.updateFormField('newPassword', 'Abcdefg1');

      const strength = component.getPasswordStrength();

      expect(strength.label).toBe('Fuerte');
      expect(strength.class).toBe('strong');
    });

    it('should return "Muy fuerte" for password with all criteria and length >= 12', () => {
      component.updateFormField('newPassword', 'Abcdefgh123!');

      const strength = component.getPasswordStrength();

      expect(strength.label).toBe('Muy fuerte');
      expect(strength.class).toBe('very-strong');
      expect(strength.percentage).toBe(100);
    });
  });

  describe('password visibility toggles', () => {
    it('should toggle showCurrentPassword', () => {
      expect(component.showCurrentPassword()).toBe(false);

      component.showCurrentPassword.set(true);

      expect(component.showCurrentPassword()).toBe(true);
    });

    it('should toggle showNewPassword', () => {
      expect(component.showNewPassword()).toBe(false);

      component.showNewPassword.set(true);

      expect(component.showNewPassword()).toBe(true);
    });

    it('should toggle showConfirmPassword', () => {
      expect(component.showConfirmPassword()).toBe(false);

      component.showConfirmPassword.set(true);

      expect(component.showConfirmPassword()).toBe(true);
    });

    it('should reset password visibility on dialog show', () => {
      component.showCurrentPassword.set(true);
      component.showNewPassword.set(true);
      component.showConfirmPassword.set(true);

      component.onDialogShow();

      expect(component.showCurrentPassword()).toBe(false);
      expect(component.showNewPassword()).toBe(false);
      expect(component.showConfirmPassword()).toBe(false);
    });
  });

  describe('onFileInputChange', () => {
    it('should set profileImagePreview when file is selected', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
        result: 'data:image/png;base64,test',
      };

      vi.spyOn(window, 'FileReader').mockImplementation(
        () => mockFileReader as unknown as FileReader
      );

      const mockEvent = {
        target: {
          files: [mockFile],
        },
      } as unknown as Event;

      component.onFileInputChange(mockEvent);

      // Simulate FileReader onload callback
      mockFileReader.onload?.({
        target: { result: 'data:image/png;base64,test' },
      } as unknown as ProgressEvent<FileReader>);

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
      expect(component.profileImagePreview()).toBe('data:image/png;base64,test');
    });

    it('should not set preview when no file is selected', () => {
      const mockEvent = {
        target: {
          files: [],
        },
      } as unknown as Event;

      component.onFileInputChange(mockEvent);

      expect(component.profileImagePreview()).toBeNull();
    });
  });

  describe('removeImage', () => {
    it('should clear profileImagePreview', () => {
      component.profileImagePreview.set('some-image-data');

      component.removeImage();

      expect(component.profileImagePreview()).toBeNull();
    });
  });

  describe('saveProfile', () => {
    it('should set isLoading to true while saving', async () => {
      const savePromise = component.saveProfile();

      expect(component.isLoading()).toBe(true);

      await savePromise;
    });

    it('should set success message after saving', async () => {
      await component.saveProfile();

      expect(component.successMessage()).toBe('Perfil actualizado correctamente');
    });

    it('should set isLoading to false after saving completes', async () => {
      await component.saveProfile();

      expect(component.isLoading()).toBe(false);
    });

    it('should clear error message before saving', async () => {
      component.errorMessage.set('Previous error');

      const savePromise = component.saveProfile();

      expect(component.errorMessage()).toBeNull();

      await savePromise;
    });
  });

  describe('changePassword validations', () => {
    it('should show error when currentPassword is empty', async () => {
      component.setActiveSection('password');
      component.updateFormField('currentPassword', '');
      component.updateFormField('newPassword', 'newpassword123');
      component.updateFormField('confirmPassword', 'newpassword123');

      await component.changePassword();

      expect(component.errorMessage()).toBe('Ingresa tu contraseña actual');
    });

    it('should show error when newPassword is empty', async () => {
      component.setActiveSection('password');
      component.updateFormField('currentPassword', 'oldpassword');
      component.updateFormField('newPassword', '');
      component.updateFormField('confirmPassword', '');

      await component.changePassword();

      expect(component.errorMessage()).toBe('Ingresa la nueva contraseña');
    });

    it('should set success message after successful password change', async () => {
      component.setActiveSection('password');
      component.updateFormField('currentPassword', 'oldpassword');
      component.updateFormField('newPassword', 'newpassword123');
      component.updateFormField('confirmPassword', 'newpassword123');

      await component.changePassword();

      expect(component.successMessage()).toBe('Contraseña actualizada correctamente');
    });

    it('should clear password fields after successful change', async () => {
      component.setActiveSection('password');
      component.updateFormField('currentPassword', 'oldpassword');
      component.updateFormField('newPassword', 'newpassword123');
      component.updateFormField('confirmPassword', 'newpassword123');

      await component.changePassword();

      const formData = component.formData();
      expect(formData.currentPassword).toBe('');
      expect(formData.newPassword).toBe('');
      expect(formData.confirmPassword).toBe('');
    });
  });

  describe('closeDialog', () => {
    it('should call dialogService.closeProfileDialog', () => {
      component.closeDialog();

      expect(mockDialogService.closeProfileDialog).toHaveBeenCalled();
    });

    it('should reset form state when dialog is hidden', () => {
      component.updateFormField('name', 'New Name');
      component.profileImagePreview.set('some-image');
      component.setActiveSection('password');
      component.errorMessage.set('Some error');
      component.successMessage.set('Some success');
      component.showCurrentPassword.set(true);

      component.onDialogHide();

      expect(component.formData().name).toBe('');
      expect(component.profileImagePreview()).toBeNull();
      expect(component.activeSection()).toBe('profile');
      expect(component.errorMessage()).toBeNull();
      expect(component.successMessage()).toBeNull();
      expect(component.showCurrentPassword()).toBe(false);
    });
  });

  describe('successMessage clearing', () => {
    it('should clear successMessage when switching sections', () => {
      component.successMessage.set('Some success');

      component.setActiveSection('password');

      expect(component.successMessage()).toBeNull();
    });
  });
});
