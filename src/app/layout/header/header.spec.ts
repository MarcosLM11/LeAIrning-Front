import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Header } from './header';
import { AuthService } from '../../core/services/auth';
import { DialogService } from '../../shared/services/dialog';
import { User } from '../../core/models/auth.model';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
    logout: ReturnType<typeof vi.fn>;
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
      logout: vi.fn(),
    };

    mockDialogService = {
      profileDialogVisible: signal(false),
      openProfileDialog: vi.fn(),
      closeProfileDialog: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        provideAnimations(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: DialogService, useValue: mockDialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user avatar', () => {
    const avatar = fixture.debugElement.query(By.css('.user-avatar'));
    expect(avatar).toBeTruthy();
  });

  it('should display current user name', () => {
    const username = fixture.debugElement.query(By.css('.username'));
    expect(username.nativeElement.textContent).toContain('Test User');
  });

  it('should display user initials in avatar', () => {
    expect(component.getUserInitials()).toBe('T');
  });

  it('should toggle menu on avatar click', () => {
    expect(component.isMenuOpen()).toBe(false);

    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(true);

    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(false);
  });

  it('should show dropdown menu when open', async () => {
    component.isMenuOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const dropdown = fixture.debugElement.query(By.css('.user-dropdown'));
    expect(dropdown).toBeTruthy();
  });

  it('should call authService.logout when logout is triggered', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
  });

  it('should display fallback initial when no user', () => {
    mockAuthService.currentUser.set(null);
    fixture.detectChanges();

    expect(component.getUserInitials()).toBe('?');
  });

  it('should close menu when logout is called', () => {
    component.isMenuOpen.set(true);
    component.logout();

    expect(component.isMenuOpen()).toBe(false);
  });

  it('should open profile dialog via service and close menu', () => {
    component.isMenuOpen.set(true);
    component.openProfileDialog();

    expect(component.isMenuOpen()).toBe(false);
    expect(mockDialogService.openProfileDialog).toHaveBeenCalledTimes(1);
  });

  it('should close menu on escape key', () => {
    component.isMenuOpen.set(true);
    component.onEscapeKey();

    expect(component.isMenuOpen()).toBe(false);
  });
});
