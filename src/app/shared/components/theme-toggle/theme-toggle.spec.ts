import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ThemeToggleComponent } from './theme-toggle';
import { ThemeService } from '../../services/theme.service';
import { signal } from '@angular/core';

describe('ThemeToggleComponent', () => {
  let mockThemeService: { isDarkMode: ReturnType<typeof signal<boolean>>; toggleTheme: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockThemeService = {
      isDarkMode: signal(false),
      toggleTheme: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ThemeService, useValue: mockThemeService },
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should reflect dark mode state', () => {
    mockThemeService.isDarkMode.set(true);
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isDarkMode()).toBe(true);
  });

  it('should call toggleTheme on toggle', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.componentInstance.toggleTheme();
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });
});
