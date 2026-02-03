import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { HeroSectionComponent, QuickAction } from '../../../../shared/components/hero-section/hero-section';
import { FabMenuComponent, FabAction } from '../../../../shared/components/fab-menu/fab-menu';
import { SkeletonActivityItemComponent } from '../../../../shared/components/skeleton-loader/skeleton-activity-item';
import { AuthService } from '../../../../core/services/auth';
import { DocumentService } from '../../../../core/services/document';
import { ChatService } from '../../../../core/services/chat';
import { Document } from '../../../../core/models/document.model';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    CardModule,
    HeroSectionComponent,
    FabMenuComponent,
    SkeletonActivityItemComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private documentService = inject(DocumentService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  currentUser = computed(() => {
    const user = this.authService.currentUser();
    return { name: user?.name ?? 'Usuario' };
  });

  isLoadingActivity = signal(true);
  recentDocuments = signal<Document[]>([]);
  totalDocuments = signal(0);

  quickActions: QuickAction[] = [
    {
      label: 'Subir Documento',
      icon: 'pi-upload',
      route: '/documents',
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

  fabActions: FabAction[] = [
    {
      label: 'Subir Documento',
      icon: 'pi-upload',
      route: '/documents',
      color: '#10b981'
    },
    {
      label: 'Iniciar Chat',
      icon: 'pi-comments',
      route: '/chat',
      color: '#f59e0b'
    }
  ];

  aiSuggestion = computed(() => {
    const total = this.totalDocuments();
    const conversations = this.chatService.conversations();
    if (total === 0) {
      return 'Sube tu primer documento para comenzar a aprender con IA.';
    }
    if (conversations.length === 0) {
      return `Tienes ${total} documento(s). ¡Inicia un chat para explorar su contenido!`;
    }
    return `Tienes ${total} documento(s) y ${conversations.length} conversación(es). ¡Sigue aprendiendo!`;
  });

  stats = computed(() => {
    const total = this.totalDocuments();
    const conversations = this.chatService.conversations();
    const storageUsed = this.recentDocuments().reduce((acc, doc) => acc + doc.size, 0);
    return [
      {
        title: 'Documentos',
        value: total,
        icon: 'pi-file',
        color: '#10b981'
      },
      {
        title: 'Chats',
        value: conversations.length,
        icon: 'pi-comments',
        color: '#f59e0b'
      },
      {
        title: 'Almacenamiento',
        value: this.formatStorageSize(storageUsed),
        icon: 'pi-database',
        color: '#8b5cf6'
      }
    ];
  });

  recentActivity = computed<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];
    for (const doc of this.recentDocuments()) {
      activities.push({
        id: `doc-${doc.id}`,
        type: 'document',
        title: 'Documento subido',
        description: doc.fileName,
        timestamp: new Date(),
        icon: this.getDocumentIcon(doc.contentType),
        color: '#10b981'
      });
    }
    for (const conv of this.chatService.conversations().slice(0, 3)) {
      activities.push({
        id: `chat-${conv.id}`,
        type: 'chat',
        title: 'Conversación',
        description: conv.title,
        timestamp: conv.updatedAt,
        icon: 'pi-comments',
        color: '#3b82f6'
      });
    }
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  });

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoadingActivity.set(true);
    try {
      const docsResult = await this.documentService.list({ size: 5, sort: 'createdTimestamp,desc' }).toPromise().catch(() => null);
      if (docsResult) {
        this.recentDocuments.set(docsResult.content);
        this.totalDocuments.set(docsResult.totalElements);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoadingActivity.set(false);
    }
  }

  private formatStorageSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private getDocumentIcon(contentType: string): string {
    if (contentType.includes('pdf')) return 'pi-file-pdf';
    if (contentType.includes('word') || contentType.includes('document')) return 'pi-file-word';
    if (contentType.includes('csv') || contentType.includes('excel')) return 'pi-file-excel';
    return 'pi-file';
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