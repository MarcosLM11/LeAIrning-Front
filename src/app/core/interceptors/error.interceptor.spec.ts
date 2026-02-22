import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('should navigate to /error/500 on 500 error', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    http.get('/api/data').subscribe({ error: () => {} });
    httpMock.expectOne('/api/data').flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    expect(navigateSpy).toHaveBeenCalledWith(['/error/500']);
  });

  it('should not navigate on 404 error', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    http.get('/api/data').subscribe({ error: () => {} });
    httpMock.expectOne('/api/data').flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should re-throw the error', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    let receivedError: HttpErrorResponse | undefined;
    http.get('/api/data').subscribe({ error: (err) => { receivedError = err; } });
    httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'Server Error' });
    expect(receivedError).toBeDefined();
    expect(receivedError!.status).toBe(500);
  });
});
