import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthService: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = { getToken: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should add Authorization header when token exists', () => {
    mockAuthService.getToken.mockReturnValue('my-jwt');
    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt');
    req.flush({});
  });

  it('should not add header when no token', () => {
    mockAuthService.getToken.mockReturnValue(null);
    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should skip auth routes', () => {
    mockAuthService.getToken.mockReturnValue('my-jwt');
    http.get('/auth/login').subscribe();
    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should skip token routes', () => {
    mockAuthService.getToken.mockReturnValue('my-jwt');
    http.post('/token/refresh', null).subscribe();
    const req = httpMock.expectOne('/token/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
