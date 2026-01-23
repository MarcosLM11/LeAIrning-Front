import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface QuickAction {
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  color: string;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss'
})
export class HeroSectionComponent {
  @Input() greeting: string = '¡Bienvenido de nuevo!';
  @Input() username: string = '';
  @Input() suggestion: string = '';
  @Input() quickActions: QuickAction[] = [];

  // Particles para animación de fondo
  particles = Array.from({ length: 15 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10
  }));

  constructor(private router: Router) {}

  getGreeting(): string {
    const hour = new Date().getHours();
    const name = this.username ? `, ${this.username}` : '';

    if (hour < 12) {
      return `Buenos días${name}`;
    } else if (hour < 19) {
      return `Buenas tardes${name}`;
    } else {
      return `Buenas noches${name}`;
    }
  }

  handleQuickAction(action: QuickAction): void {
    if (action.action) {
      action.action();
    } else if (action.route) {
      this.router.navigate([action.route]);
    }
  }
}
