import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID, signal } from '@angular/core';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Exchange } from './exchange';
import { AuthService } from '../../../../core/services/auth';
import { ThemeService } from '../../../../shared/services/theme.service';

describe('Exchange', () => {
  function create(queryParams: Record<string, string> = {}, platformId = 'browser', exchangeResult?: any) {
    const mockAuthService = { exchangeCodeFromOAuth: vi.fn().mockReturnValue(exchangeResult ?? of(null)) };
    const mockThemeService = { isDarkMode: signal(false), toggleTheme: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: (key: string) => queryParams[key] ?? null } } },
        },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Exchange);
    fixture.detectChanges();
    return { fixture, mockAuthService };
  }

  it('should create', () => {
    expect(create().fixture.componentInstance).toBeTruthy();
  });

  it('should not process on server platform', () => {
    const { fixture, mockAuthService } = create({}, 'server');
    expect(fixture.componentInstance.isProcessing()).toBe(true);
    expect(mockAuthService.exchangeCodeFromOAuth).not.toHaveBeenCalled();
  });

  it('should show error when no code provided', () => {
    const comp = create().fixture.componentInstance;
    expect(comp.isProcessing()).toBe(false);
    expect(comp.errorMessage()).toBe('Código de autorización no proporcionado');
  });

  it('should exchange code on success', () => {
    const { mockAuthService } = create({ code: 'oauth-code' }, 'browser', of({ id: '1' }));
    expect(mockAuthService.exchangeCodeFromOAuth).toHaveBeenCalledWith('oauth-code');
  });

  it('should set error on 401 failure', () => {
    const comp = create({ code: 'bad' }, 'browser', throwError(() => ({ status: 401 }))).fixture.componentInstance;
    expect(comp.errorMessage()).toBe('El código de autorización es inválido o ha expirado');
  });

  it('should set generic error on other failures', () => {
    const comp = create({ code: 'c' }, 'browser', throwError(() => ({ status: 500 }))).fixture.componentInstance;
    expect(comp.errorMessage()).toBe('Error al iniciar sesión. Intenta nuevamente.');
  });
});
