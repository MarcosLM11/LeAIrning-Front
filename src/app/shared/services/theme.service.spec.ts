import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme');
  });

  function createService(): ThemeService {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    return TestBed.inject(ThemeService);
  }

  it('should start in light mode by default', () => {
    const service = createService();
    expect(service.isDarkMode()).toBe(false);
  });

  it('should load dark theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const service = createService();
    expect(service.isDarkMode()).toBe(true);
  });

  it('should toggle theme', () => {
    const service = createService();
    expect(service.isDarkMode()).toBe(false);
    service.toggleTheme();
    expect(service.isDarkMode()).toBe(true);
    service.toggleTheme();
    expect(service.isDarkMode()).toBe(false);
  });
});
