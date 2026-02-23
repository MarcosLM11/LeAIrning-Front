import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth';
import { StorageService } from '../../shared/services/storage.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageMock: {
    get: ReturnType<typeof vi.fn>;
    getString: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    setString: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    isSession: ReturnType<typeof vi.fn>;
  };
  let router: Router;
  const authUrl = `${environment.apiUrl}/auth`;
  const usersUrl = `${environment.apiUrl}/users`;
  const tokenUrl = `${environment.apiUrl}/token`;

  beforeEach(() => {
    storageMock = {
      get: vi.fn().mockReturnValue(null),
      getString: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      setString: vi.fn(),
      remove: vi.fn(),
      isSession: vi.fn().mockReturnValue(false),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: StorageService, useValue: storageMock },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load user from storage on creation', () => {
    storageMock.get.mockReturnValue({ id: '1', name: 'Test', email: 'test@test.com' });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: StorageService, useValue: storageMock },
      ],
    });
    const freshService = TestBed.inject(AuthService);
    expect(freshService.currentUser()).toEqual({ id: '1', name: 'Test', email: 'test@test.com' });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user and no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when currentUser is set', () => {
      storageMock.get.mockReturnValue({ id: '1', name: 'T', email: 'e' });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          { provide: StorageService, useValue: storageMock },
        ],
      });
      const s = TestBed.inject(AuthService);
      expect(s.isAuthenticated()).toBe(true);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no token', () => {
      storageMock.getString.mockReturnValue(null);
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true for expired token', () => {
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
      storageMock.getString.mockReturnValue(`header.${payload}.sig`);
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return false for valid token', () => {
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
      storageMock.getString.mockReturnValue(`header.${payload}.sig`);
      expect(service.isTokenExpired()).toBe(false);
    });

    it('should return true for malformed token', () => {
      storageMock.getString.mockReturnValue('not-a-jwt');
      expect(service.isTokenExpired()).toBe(true);
    });
  });

  describe('getToken / getRefreshToken', () => {
    it('should delegate to storage getString', () => {
      storageMock.getString.mockReturnValue('my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('should get refresh token from storage', () => {
      storageMock.getString.mockReturnValue('refresh-tok');
      expect(service.getRefreshToken()).toBe('refresh-tok');
    });
  });

  describe('register', () => {
    it('should POST to register endpoint', () => {
      service.register({ email: 'a@b.com', name: 'A', password: 'pass123' } as any).subscribe();
      const req = httpMock.expectOne(`${authUrl}/register`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('logout', () => {
    it('should clear storage and navigate to login', () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      service.logout();
      expect(storageMock.remove).toHaveBeenCalledTimes(3);
      expect(service.currentUser()).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('login', () => {
    it('should login, exchange code, fetch user, and set state', () => {
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe(user => {
        expect(user.name).toBe('Test');
      });

      // Step 1: POST login → auth code
      const loginReq = httpMock.expectOne(`${authUrl}/login`);
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush({ auth_code: 'code-123' });

      // Step 2: GET exchange → tokens
      const exchangeReq = httpMock.expectOne(r => r.url === `${authUrl}/code/exchange`);
      expect(exchangeReq.request.params.get('code')).toBe('code-123');
      exchangeReq.flush({ access_token: 'at', refresh_token: 'rt' });

      // Step 3: GET user
      const userReq = httpMock.expectOne(`${usersUrl}/me`);
      userReq.flush({ id: '1', name: 'Test', email: 'test@test.com' });

      expect(storageMock.setString).toHaveBeenCalled();
      expect(storageMock.set).toHaveBeenCalled();
      expect(service.currentUser()).toEqual({ id: '1', name: 'Test', email: 'test@test.com' });
    });
  });

  describe('refreshToken', () => {
    it('should POST with refresh token in Authorization header', () => {
      storageMock.getString.mockReturnValue('my-refresh');
      service.refreshToken().subscribe();
      const req = httpMock.expectOne(`${tokenUrl}/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer my-refresh');
      req.flush({ access_token: 'new-at', refresh_token: 'new-rt' });
      expect(storageMock.setString).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify, exchange code, fetch user', () => {
      service.verifyEmail('verify-token').subscribe(user => {
        expect(user.name).toBe('Test');
      });

      httpMock.expectOne(r => r.url === `${authUrl}/verify`).flush({ auth_code: 'code' });
      httpMock.expectOne(r => r.url === `${authUrl}/code/exchange`).flush({ access_token: 'at', refresh_token: 'rt' });
      httpMock.expectOne(`${usersUrl}/me`).flush({ id: '1', name: 'Test', email: 'e@t.com' });
    });
  });

  describe('exchangeCodeFromOAuth', () => {
    it('should exchange code, store tokens, fetch user', () => {
      service.exchangeCodeFromOAuth('oauth-code').subscribe(user => {
        expect(user.id).toBe('1');
      });

      httpMock.expectOne(r => r.url === `${authUrl}/code/exchange`).flush({ access_token: 'at', refresh_token: 'rt' });
      httpMock.expectOne(`${usersUrl}/me`).flush({ id: '1', name: 'OAuth User', email: 'o@t.com' });
    });
  });
});
