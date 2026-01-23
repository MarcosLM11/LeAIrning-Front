import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonShape = 'rectangle' | 'circle' | 'text' | 'card' | 'avatar';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss'
})
export class SkeletonLoaderComponent {
  @Input() shape: SkeletonShape = 'rectangle';
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() count: number = 1;
  @Input() circle: boolean = false;
  @Input() animation: 'pulse' | 'wave' = 'wave';

  get items(): number[] {
    return Array(this.count).fill(0);
  }
}
