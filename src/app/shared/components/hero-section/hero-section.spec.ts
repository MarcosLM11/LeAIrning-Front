import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { HeroSectionComponent, QuickAction } from './hero-section';

describe('HeroSectionComponent', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    router = TestBed.inject(Router);
  });

  function create() {
    const fixture = TestBed.createComponent(HeroSectionComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should have default greeting', () => {
    expect(create().componentInstance.greeting).toBe('¡Bienvenido de nuevo!');
  });

  it('should generate 15 particles', () => {
    expect(create().componentInstance.particles.length).toBe(15);
  });

  it('should return time-based greeting with username', () => {
    const comp = create().componentInstance;
    comp.username = 'Ana';
    const greeting = comp.getGreeting();
    expect(greeting).toMatch(/Buenos días, Ana|Buenas tardes, Ana|Buenas noches, Ana/);
  });

  it('should return greeting without name when username empty', () => {
    const greeting = create().componentInstance.getGreeting();
    expect(greeting).toMatch(/Buenos días|Buenas tardes|Buenas noches/);
    expect(greeting).not.toContain(',');
  });

  it('should execute quick action callback', () => {
    const callback = vi.fn();
    const action: QuickAction = { label: 'Test', icon: 'pi-star', color: 'green', action: callback };
    create().componentInstance.handleQuickAction(action);
    expect(callback).toHaveBeenCalled();
  });

  it('should navigate when quick action has route', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const action: QuickAction = { label: 'Nav', icon: 'pi-arrow', color: 'blue', route: '/chat' };
    create().componentInstance.handleQuickAction(action);
    expect(navigateSpy).toHaveBeenCalledWith(['/chat']);
  });
});
