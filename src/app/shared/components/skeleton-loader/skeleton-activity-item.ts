import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from './skeleton-loader';

@Component({
  selector: 'app-skeleton-activity-item',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  template: `
    <div class="skeleton-activity-item">
      <!-- Icon -->
      <app-skeleton-loader
        [circle]="true"
        width="48px"
        height="48px"
        [animation]="animation"
      />

      <!-- Content -->
      <div class="skeleton-activity-content">
        <app-skeleton-loader
          shape="text"
          width="60%"
          height="18px"
          [animation]="animation"
        />
        <app-skeleton-loader
          shape="text"
          width="90%"
          height="14px"
          [animation]="animation"
        />
        <app-skeleton-loader
          shape="text"
          width="30%"
          height="12px"
          [animation]="animation"
        />
      </div>
    </div>
  `,
  styles: [`
    @use '../../styles/design-system' as *;

    .skeleton-activity-item {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg) 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }
    }

    .skeleton-activity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
  `]
})
export class SkeletonActivityItemComponent {
  @Input() animation: 'pulse' | 'wave' = 'wave';
}
