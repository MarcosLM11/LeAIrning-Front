import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthIllustrationComponent } from './auth-illustration.component';

describe('AuthIllustrationComponent', () => {
  function create(type: 'login' | 'register' = 'login') {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(AuthIllustrationComponent);
    fixture.componentInstance.type = type;
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should accept login type', () => {
    expect(create('login').componentInstance.type).toBe('login');
  });

  it('should accept register type', () => {
    expect(create('register').componentInstance.type).toBe('register');
  });
});
