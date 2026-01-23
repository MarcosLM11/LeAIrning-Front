import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { HeroSectionComponent, QuickAction } from '../../../../shared/components/hero-section/hero-section';
import { FabMenuComponent, FabAction } from '../../../../shared/components/fab-menu/fab-menu';
import { SkeletonActivityItemComponent } from '../../../../shared/components/skeleton-loader/skeleton-activity-item';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    HeroSectionComponent,
    FabMenuComponent,
    SkeletonActivityItemComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  // User info (en producción vendría de un servicio/store)
  currentUser = signal({ username: 'Marcos' });

  // Loading states
  isLoadingActivity = signal(true);

  // Quick actions para el Hero Section
  quickActions: QuickAction[] = [
    {
      label: 'Subir Documento',
      icon: 'pi-upload',
      route: '/documents/upload',
      color: '#10b981'
    },
    {
      label: 'Iniciar Chat',
      icon: 'pi-comments',
      route: '/chat',
      color: '#f59e0b'
    },
    {
      label: 'Generar Quiz',
      icon: 'pi-question-circle',
      route: '/quizzes/generate',
      color: '#8b5cf6'
    }
  ];

  // FAB actions (similar pero para el menú flotante)
  fabActions: FabAction[] = [
    {
      label: 'Subir Documento',
      icon: 'pi-upload',
      route: '/documents/upload',
      color: '#10b981'
    },
    {
      label: 'Iniciar Chat',
      icon: 'pi-comments',
      route: '/chat',
      color: '#f59e0b'
    }
  ];

  // AI Suggestion
  aiSuggestion = signal('Tienes 3 documentos sin procesar. ¿Quieres generar un resumen automático?');

  // Datos de ejemplo para el dashboard
  stats = [
    { title: 'Documentos', value: 48, icon: 'pi-file', color: '#10b981' },
    { title: 'Chats', value: 156, icon: 'pi-comments', color: '#f59e0b' },
    { title: 'Resúmenes', value: 24, icon: 'pi-book', color: '#8b5cf6' },
  ];

  // Recent activity
  recentActivity = signal([
    {
      id: '1',
      type: 'quiz',
      title: 'Quiz completado',
      description: 'Machine Learning Basics - 85% de aciertos',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'pi-check-circle',
      color: '#10b981'
    },
    {
      id: '2',
      type: 'document',
      title: 'Documento procesado',
      description: 'neural_networks.pdf agregado a "AI Research"',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: 'pi-file-pdf',
      color: '#f59e0b'
    },
    {
      id: '3',
      type: 'summary',
      title: 'Resumen generado',
      description: 'Resumen de 5 documentos en "Web Development"',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      icon: 'pi-book',
      color: '#8b5cf6'
    },
    {
      id: '4',
      type: 'chat',
      title: 'Nueva conversación',
      description: 'Chat iniciado sobre "React Hooks"',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: 'pi-comments',
      color: '#3b82f6'
    }
  ]);

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simular carga de actividad
    setTimeout(() => {
      this.isLoadingActivity.set(false);
    }, 2000);
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }
  }
}