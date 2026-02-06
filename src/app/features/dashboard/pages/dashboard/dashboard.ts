import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { HeroSectionComponent, QuickAction } from '../../../../shared/components/hero-section/hero-section';
import { FabMenuComponent, FabAction } from '../../../../shared/components/fab-menu/fab-menu';
import { SkeletonActivityItemComponent } from '../../../../shared/components/skeleton-loader/skeleton-activity-item';
import { AuthService } from '../../../../core/services/auth';
import { DocumentService } from '../../../../core/services/document';
import { ChatService } from '../../../../core/services/chat';
import { Document } from '../../../../core/models/document.model';
import { formatFileSize, getDocumentIcon } from '../../../../shared/utils/file.utils';
import { getRelativeTime } from '../../../../shared/utils/date.utils';
import { firstValueFrom } from 'rxjs';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Subir Documento', icon: 'pi-upload', route: '/documents', color: '#10b981' },
  { label: 'Iniciar Chat', icon: 'pi-comments', route: '/chat', color: '#f59e0b' },
  { label: 'Generar Quiz', icon: 'pi-question-circle', route: '/quizzes/generate', color: '#8b5cf6' }
];

const FAB_ACTIONS: FabAction[] = [
  { label: 'Subir Documento', icon: 'pi-upload', route: '/documents', color: '#10b981' },
  { label: 'Iniciar Chat', icon: 'pi-comments', route: '/chat', color: '#f59e0b' }
];

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

  isLoadingActivity = signal(true);
  recentDocuments = signal<Document[]>([]);
  totalDocuments = signal(0);

  readonly quickActions = QUICK_ACTIONS;
  readonly fabActions = FAB_ACTIONS;

  currentUser = computed(() => ({
    name: this.authService.currentUser()?.name ?? 'Usuario'
  }));

  aiSuggestion = computed(() => {
    const total = this.totalDocuments();
    const conversations = this.chatService.conversations();

    if (total === 0) return 'Sube tu primer documento para comenzar a aprender con IA.';
    if (conversations.length === 0) return `Tienes ${total} documento(s). ¡Inicia un chat para explorar su contenido!`;
    return `Tienes ${total} documento(s) y ${conversations.length} conversación(es). ¡Sigue aprendiendo!`;
  });

  stats = computed(() => {
    const storageUsed = this.recentDocuments().reduce((acc, doc) => acc + doc.size, 0);
    return [
      { title: 'Documentos', value: this.totalDocuments(), icon: 'pi-file', color: '#10b981', route: '/documents' },
      { title: 'Chats', value: this.chatService.conversations().length, icon: 'pi-comments', color: '#f59e0b', route: '/chat' },
      { title: 'Almacenamiento', value: formatFileSize(storageUsed), icon: 'pi-database', color: '#8b5cf6', route: null }
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
        icon: getDocumentIcon(doc.contentType),
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

  // Re-export for template
  getRelativeTime = getRelativeTime;

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoadingActivity.set(true);
    try {
      const [docsResult, _] = await Promise.all([
        firstValueFrom(this.documentService.list({ page: 0, size: 5, sort: 'createdTimestamp,desc' })).catch(err => {
          console.error('Error loading documents:', err);
          return null;
        }),
        firstValueFrom(this.chatService.loadConversations()).catch(err => {
          console.error('Error loading conversations:', err);
          return null;
        })
      ]);

      if (docsResult) {
        this.recentDocuments.set(docsResult.content);
        this.totalDocuments.set(docsResult.totalElements);
      }
    } finally {
      this.isLoadingActivity.set(false);
    }
  }

  navigateTo(route: string | null): void {
    if (route) {
      this.router.navigate([route]);
    }
  }
}
