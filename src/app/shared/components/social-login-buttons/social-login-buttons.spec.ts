import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SocialLoginButtons } from './social-login-buttons';

describe('SocialLoginButtons', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function create() {
    const fixture = TestBed.createComponent(SocialLoginButtons);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should have default button texts', () => {
    const comp = create().componentInstance;
    expect(comp.googleText()).toBe('Continuar con Google');
    expect(comp.githubText()).toBe('Continuar con GitHub');
  });

  it('should not redirect when disabled', () => {
    const fixture = TestBed.createComponent(SocialLoginButtons);
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    const originalHref = window.location.href;
    fixture.componentInstance.onGoogleClick();
    expect(window.location.href).toBe(originalHref);
  });
});
