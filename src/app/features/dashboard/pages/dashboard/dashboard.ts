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
import { DocumentStatistics, Document } from '../../../../core/models/document.model';

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

  // User info from AuthService
  currentUser = computed(() => {
    const user = this.authService.currentUser();
    return { username: user?.username ?? 'Usuario' };
  });

  // Loading states
  isLoadingActivity = signal(true);

  // Statistics from backend
  documentStats = signal<DocumentStatistics | null>(null);
  recentDocuments = signal<Document[]>([]);

  // Quick actions para el Hero Section
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

  // FAB actions (similar pero para el menú flotante)
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

  // AI Suggestion based on actual data
  aiSuggestion = computed(() => {
    const stats = this.documentStats();
    const conversations = this.chatService.conversations();

    if (!stats || stats.totalDocuments === 0) {
      return 'Sube tu primer documento para comenzar a aprender con IA.';
    }

    if (conversations.length === 0) {
      return `Tienes ${stats.totalDocuments} documento(s). ¡Inicia un chat para explorar su contenido!`;
    }

    return `Tienes ${stats.totalDocuments} documento(s) y ${conversations.length} conversación(es). ¡Sigue aprendiendo!`;
  });

  // Stats computed from real data
  stats = computed(() => {
    const docStats = this.documentStats();
    const conversations = this.chatService.conversations();

    return [
      {
        title: 'Documentos',
        value: docStats?.totalDocuments ?? 0,
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
        value: this.formatStorageSize(docStats?.storageUsed ?? 0),
        icon: 'pi-database',
        color: '#8b5cf6'
      }
    ];
  });

  // Recent activity computed from documents and conversations
  recentActivity = computed<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];

    // Add recent documents
    for (const doc of this.recentDocuments()) {
      activities.push({
        id: `doc-${doc.id}`,
        type: 'document',
        title: this.getDocumentStatusTitle(doc.status),
        description: doc.originalFilename,
        timestamp: new Date(doc.updatedAt),
        icon: this.getDocumentIcon(doc.documentType),
        color: this.getDocumentStatusColor(doc.status)
      });
    }

    // Add recent conversations
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

    // Sort by timestamp (most recent first)
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
      // Load statistics and recent documents in parallel
      const [statsResult, docsResult] = await Promise.all([
        this.documentService.getStatistics().toPromise().catch(() => null),
        this.documentService.list({ size: 5, sort: 'updatedAt,desc' }).toPromise().catch(() => null)
      ]);

      if (statsResult) {
        this.documentStats.set(statsResult);
      }

      if (docsResult) {
        this.recentDocuments.set(docsResult.content);
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

  private getDocumentStatusTitle(status: string): string {
    switch (status) {
      case 'UPLOADED': return 'Documento subido';
      case 'PROCESSING': return 'Procesando documento';
      case 'COMPLETED': return 'Documento listo';
      case 'FAILED': return 'Error en documento';
      default: return 'Documento';
    }
  }

  private getDocumentStatusColor(status: string): string {
    switch (status) {
      case 'UPLOADED': return '#f59e0b';
      case 'PROCESSING': return '#3b82f6';
      case 'COMPLETED': return '#10b981';
      case 'FAILED': return '#ef4444';
      default: return '#6b7280';
    }
  }

  private getDocumentIcon(type: string): string {
    switch (type) {
      case 'PDF': return 'pi-file-pdf';
      case 'DOC':
      case 'DOCX': return 'pi-file-word';
      case 'CSV': return 'pi-file-excel';
      default: return 'pi-file';
    }
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