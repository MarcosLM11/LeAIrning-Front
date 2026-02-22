import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  let form: FormGroup;

  beforeEach(() => {
    form = new FormGroup(
      {
        password: new FormControl(''),
        confirmPassword: new FormControl(''),
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );
  });

  it('should return null when passwords match', () => {
    form.get('password')!.setValue('secret123');
    form.get('confirmPassword')!.setValue('secret123');
    expect(form.errors).toBeNull();
    expect(form.get('confirmPassword')!.hasError('passwordMismatch')).toBe(false);
  });

  it('should return passwordMismatch when passwords differ', () => {
    form.get('password')!.setValue('secret123');
    form.get('confirmPassword')!.setValue('different');
    expect(form.errors).toEqual({ passwordMismatch: true });
    expect(form.get('confirmPassword')!.hasError('passwordMismatch')).toBe(true);
  });

  it('should clear mismatch error when passwords become equal', () => {
    form.get('password')!.setValue('secret123');
    form.get('confirmPassword')!.setValue('different');
    expect(form.get('confirmPassword')!.hasError('passwordMismatch')).toBe(true);

    form.get('confirmPassword')!.setValue('secret123');
    expect(form.get('confirmPassword')!.hasError('passwordMismatch')).toBe(false);
  });

  it('should return null when fields are missing', () => {
    const emptyForm = new FormGroup(
      {},
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );
    expect(emptyForm.errors).toBeNull();
  });
});
