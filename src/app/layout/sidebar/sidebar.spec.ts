import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Sidebar } from './sidebar';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/auth.model';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
  };

  const mockUser: User = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockAuthService = {
      currentUser: signal<User | null>(mockUser),
    };

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current user name', () => {
    const userInfo = fixture.debugElement.query(By.css('.user-info .menu-label'));
    expect(userInfo).toBeTruthy();
    expect(userInfo.nativeElement.textContent).toContain('Test User');
  });

  it('should display fallback text when no user is logged in', async () => {
    mockAuthService.currentUser.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    const userInfo = fixture.debugElement.query(By.css('.user-info .menu-label'));
    expect(userInfo.nativeElement.textContent).toContain('Usuario');
  });
});
