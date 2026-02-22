import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { FabMenuComponent, FabAction } from './fab-menu';

describe('FabMenuComponent', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    router = TestBed.inject(Router);
  });

  function create(actions: FabAction[] = []) {
    const fixture = TestBed.createComponent(FabMenuComponent);
    fixture.componentInstance.actions = actions;
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should start closed', () => {
    expect(create().componentInstance.isOpen()).toBe(false);
  });

  it('should toggle open and closed', () => {
    const comp = create().componentInstance;
    comp.toggleFab();
    expect(comp.isOpen()).toBe(true);
    comp.toggleFab();
    expect(comp.isOpen()).toBe(false);
  });

  it('should execute action callback and close', () => {
    const callback = vi.fn();
    const action: FabAction = { label: 'Test', icon: 'pi-plus', color: 'blue', action: callback };
    const comp = create([action]).componentInstance;
    comp.isOpen.set(true);
    comp.handleAction(action);
    expect(callback).toHaveBeenCalled();
    expect(comp.isOpen()).toBe(false);
  });

  it('should navigate when action has route', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const action: FabAction = { label: 'Nav', icon: 'pi-arrow', color: 'red', route: '/docs' };
    const comp = create([action]).componentInstance;
    comp.handleAction(action);
    expect(navigateSpy).toHaveBeenCalledWith(['/docs']);
    expect(comp.isOpen()).toBe(false);
  });
});
