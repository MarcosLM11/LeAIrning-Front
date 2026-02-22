import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SkeletonLoaderComponent } from './skeleton-loader';

describe('SkeletonLoaderComponent', () => {
  function create(inputs: Partial<{ shape: string; width: string; height: string; count: number }> = {}) {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(SkeletonLoaderComponent);
    if (inputs.shape) fixture.componentInstance.shape = inputs.shape as any;
    if (inputs.width) fixture.componentInstance.width = inputs.width;
    if (inputs.height) fixture.componentInstance.height = inputs.height;
    if (inputs.count) fixture.componentInstance.count = inputs.count;
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should default to rectangle shape', () => {
    expect(create().componentInstance.shape).toBe('rectangle');
  });

  it('should render multiple items when count > 1', () => {
    expect(create({ count: 3 }).componentInstance.items.length).toBe(3);
  });

  it('should default count to 1', () => {
    expect(create().componentInstance.items.length).toBe(1);
  });
});
