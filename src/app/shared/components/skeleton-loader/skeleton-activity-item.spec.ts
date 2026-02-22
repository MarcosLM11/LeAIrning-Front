import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SkeletonActivityItemComponent } from './skeleton-activity-item';

describe('SkeletonActivityItemComponent', () => {
  function create(animation?: string) {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(SkeletonActivityItemComponent);
    if (animation) fixture.componentInstance.animation = animation as any;
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should default animation to wave', () => {
    expect(create().componentInstance.animation).toBe('wave');
  });

  it('should accept pulse animation', () => {
    expect(create('pulse').componentInstance.animation).toBe('pulse');
  });
});
