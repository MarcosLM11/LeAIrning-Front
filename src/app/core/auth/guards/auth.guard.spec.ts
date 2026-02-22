import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../../services/auth';

describe('authGuard', () => {
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    isTokenExpired: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
      isTokenExpired: vi.fn(),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
    router = TestBed.inject(Router);
  });

  function runGuard(url = '/dashboard'): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url } as any) as boolean | UrlTree
    );
  }

  it('should allow access when authenticated and token not expired', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.isTokenExpired.mockReturnValue(false);
    expect(runGuard()).toBe(true);
  });

  it('should redirect to login when not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    const result = runGuard('/dashboard') as UrlTree;
    expect(result.toString()).toContain('/auth/login');
    expect(result.queryParams['returnUrl']).toBe('/dashboard');
  });

  it('should logout and redirect when token is expired', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.isTokenExpired.mockReturnValue(true);
    const result = runGuard() as UrlTree;
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(result.toString()).toContain('/auth/login');
  });
});
