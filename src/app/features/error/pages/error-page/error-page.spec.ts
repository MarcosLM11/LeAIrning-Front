import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideLocationMocks } from '@angular/common/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ErrorPage } from './error-page';

function createComponent(errorType?: string): { fixture: ComponentFixture<ErrorPage>; component: ErrorPage } {
  TestBed.configureTestingModule({
    imports: [ErrorPage],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      provideAnimations(),
      provideLocationMocks(),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { data: errorType ? { errorType } : {} } }
      }
    ],
  });
  var fixture = TestBed.createComponent(ErrorPage);
  var component = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, component };
}

describe('ErrorPage', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    var { component } = createComponent();
    expect(component).toBeTruthy();
  });

  describe('404 error', () => {
    it('should display 404 error code', () => {
      var { component } = createComponent('404');
      expect(component.errorCode()).toBe('404');
    });

    it('should display correct title for 404', () => {
      var { component } = createComponent('404');
      expect(component.title()).toContain('Página no encontrada');
    });

    it('should set errorType signal to 404', () => {
      var { component } = createComponent('404');
      expect(component.errorType()).toBe('404');
    });
  });

  describe('500 error', () => {
    it('should display 500 error code', () => {
      var { component } = createComponent('500');
      expect(component.errorCode()).toBe('500');
    });

    it('should display correct title for 500', () => {
      var { component } = createComponent('500');
      expect(component.title()).toContain('Error del servidor');
    });
  });

  describe('generic error', () => {
    it('should display Oops for generic error', () => {
      var { component } = createComponent();
      expect(component.errorCode()).toBe('Oops');
    });

    it('should display correct title for generic', () => {
      var { component } = createComponent();
      expect(component.title()).toContain('Algo salió mal');
    });
  });

  describe('navigation', () => {
    it('should navigate to dashboard on goHome', () => {
      var { component } = createComponent();
      var router = TestBed.inject(Router);
      var spy = vi.spyOn(router, 'navigate');
      component.goHome();
      expect(spy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should call location.back on goBack', () => {
      var { component } = createComponent();
      var location = TestBed.inject(Location);
      var spy = vi.spyOn(location, 'back');
      component.goBack();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have role="main" on container', () => {
      var { fixture } = createComponent('404');
      var container = fixture.nativeElement.querySelector('[role="main"]');
      expect(container).toBeTruthy();
    });

    it('should have aria-labelledby pointing to title', () => {
      var { fixture } = createComponent('404');
      var container = fixture.nativeElement.querySelector('[aria-labelledby="error-title"]');
      expect(container).toBeTruthy();
    });

    it('should have aria-hidden on decorative elements', () => {
      var { fixture } = createComponent('404');
      var decorative = fixture.nativeElement.querySelectorAll('[aria-hidden="true"]');
      expect(decorative.length).toBeGreaterThan(0);
    });

    it('should have accessible button labels', () => {
      var { fixture } = createComponent('404');
      var buttons = fixture.nativeElement.querySelectorAll('button[aria-label]');
      expect(buttons.length).toBe(2);
    });
  });
});
