import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface FabAction {
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  color: string;
}

@Component({
  selector: 'app-fab-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fab-menu.html',
  styleUrl: './fab-menu.scss'
})
export class FabMenuComponent {
  @Input() actions: FabAction[] = [];

  isOpen = signal(false);

  constructor(private router: Router) {}

  toggleFab(): void {
    this.isOpen.set(!this.isOpen());
  }

  handleAction(action: FabAction): void {
    if (action.action) {
      action.action();
    } else if (action.route) {
      this.router.navigate([action.route]);
    }
    this.isOpen.set(false);
  }
}
