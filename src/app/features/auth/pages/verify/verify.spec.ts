import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Verify } from './verify';
import { AuthService } from '../../../../core/services/auth';
import { ThemeService } from '../../../../shared/services/theme.service';
import { signal } from '@angular/core';

describe('Verify', () => {
  function create(queryParams: Record<string, string> = {}, verifyResult?: any) {
    const mockAuthService = { verifyEmail: vi.fn().mockReturnValue(verifyResult ?? of(null)) };
    const mockThemeService = { isDarkMode: signal(false), toggleTheme: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: (key: string) => queryParams[key] ?? null } } },
        },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Verify);
    fixture.detectChanges();
    return { fixture, mockAuthService };
  }

  it('should create', () => {
    expect(create().fixture.componentInstance).toBeTruthy();
  });

  it('should show error when no token provided', () => {
    const comp = create().fixture.componentInstance;
    expect(comp.isVerifying()).toBe(false);
    expect(comp.errorMessage()).toBe('Token de verificación no proporcionado');
  });

  it('should verify email on init when token provided', () => {
    const { fixture, mockAuthService } = create(
      { token: 'valid-token' },
      of({ id: '1', name: 'Test', email: 't@t.com' })
    );
    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('valid-token');
    expect(fixture.componentInstance.isSuccess()).toBe(true);
    expect(fixture.componentInstance.isVerifying()).toBe(false);
  });

  it('should set error message on 400 error', () => {
    const comp = create({ token: 'bad' }, throwError(() => ({ status: 400 }))).fixture.componentInstance;
    expect(comp.errorMessage()).toBe('El token de verificación es inválido o ha expirado');
  });

  it('should set generic error on other errors', () => {
    const comp = create({ token: 'tok' }, throwError(() => ({ status: 500 }))).fixture.componentInstance;
    expect(comp.errorMessage()).toBe('Error al verificar la cuenta. Intenta nuevamente.');
  });
});
