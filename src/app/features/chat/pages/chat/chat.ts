import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { Skeleton } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ChatService } from '../../../../core/services/chat';
import { DocumentService } from '../../../../core/services/document';
import { ChatMessage, Conversation } from '../../../../core/models/chat.model';
import { Document } from '../../../../core/models/document.model';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    Skeleton
  ],
  providers: [MessageService],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Chat implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private chatService = inject(ChatService);
  private documentService = inject(DocumentService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // State
  documents = signal<Document[]>([]);
  selectedDocumentIds = signal<number[]>([]);
  currentConversation = signal<Conversation | null>(null);
  messageText = signal('');
  isLoadingDocs = signal(true);
  isSending = signal(false);
  showSidebar = signal(true);

  // Computed
  conversations = this.chatService.conversations;
  messages = computed(() => this.currentConversation()?.messages ?? []);
  hasDocuments = computed(() => this.documents().length > 0);
  completedDocuments = computed(() =>
    this.documents().filter(d => d.status === 'COMPLETED')
  );
  canSend = computed(() =>
    this.messageText().trim().length > 0 && !this.isSending()
  );
  allSelected = computed(() => {
    const completed = this.completedDocuments();
    const selected = this.selectedDocumentIds();
    return completed.length > 0 && completed.every(d => selected.includes(d.id));
  });

  private shouldScrollToBottom = false;

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private async loadDocuments(): Promise<void> {
    this.isLoadingDocs.set(true);
    try {
      const response = await this.documentService.list({ status: 'COMPLETED', size: 100 }).toPromise();
      this.documents.set(response?.content ?? []);

      // Auto-select all documents if none selected
      if (this.selectedDocumentIds().length === 0 && response?.content) {
        this.selectedDocumentIds.set(response.content.map(d => d.id));
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los documentos'
      });
    } finally {
      this.isLoadingDocs.set(false);
    }
  }

  toggleSelectAll(): void {
    const completed = this.completedDocuments();
    if (this.allSelected()) {
      this.selectedDocumentIds.set([]);
    } else {
      this.selectedDocumentIds.set(completed.map(d => d.id));
    }
  }

  toggleDocument(docId: number): void {
    this.selectedDocumentIds.update(ids => {
      if (ids.includes(docId)) {
        return ids.filter(id => id !== docId);
      }
      return [...ids, docId];
    });
  }

  isDocumentSelected(docId: number): boolean {
    return this.selectedDocumentIds().includes(docId);
  }

  startNewConversation(): void {
    if (this.selectedDocumentIds().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecciona documentos',
        detail: 'Debes seleccionar al menos un documento para chatear'
      });
      return;
    }

    const conversation = this.chatService.createConversation(
      'Nueva conversación',
      this.selectedDocumentIds()
    );
    this.currentConversation.set(conversation);
    this.messageText.set('');
  }

  selectConversation(conversation: Conversation): void {
    this.currentConversation.set(conversation);
    this.selectedDocumentIds.set(conversation.documentIds);
    this.shouldScrollToBottom = true;
  }

  deleteConversation(conversation: Conversation, event: Event): void {
    event.stopPropagation();
    this.chatService.deleteConversation(conversation.id);
    if (this.currentConversation()?.id === conversation.id) {
      this.currentConversation.set(null);
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.messageText().trim();
    if (!text || this.isSending()) return;

    let conversation = this.currentConversation();

    // Create new conversation if none exists
    if (!conversation) {
      if (this.selectedDocumentIds().length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Selecciona documentos',
          detail: 'Debes seleccionar al menos un documento para chatear'
        });
        return;
      }
      conversation = this.chatService.createConversation(
        text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        this.selectedDocumentIds()
      );
      this.currentConversation.set(conversation);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    this.chatService.addMessage(conversation.id, userMessage);
    this.currentConversation.set(this.chatService.getConversation(conversation.id) ?? null);
    this.messageText.set('');
    this.shouldScrollToBottom = true;
    this.isSending.set(true);

    try {
      const response = await this.chatService.ask(text, conversation.id).toPromise();

      if (response) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(response.timestamp)
        };

        this.chatService.addMessage(conversation.id, assistantMessage);
        this.currentConversation.set(this.chatService.getConversation(conversation.id) ?? null);
        this.shouldScrollToBottom = true;
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo enviar el mensaje. Inténtalo de nuevo.'
      });
    } finally {
      this.isSending.set(false);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleSidebar(): void {
    this.showSidebar.update(v => !v);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDocumentIcon(doc: Document): string {
    switch (doc.documentType) {
      case 'PDF': return 'pi-file-pdf';
      case 'DOC':
      case 'DOCX': return 'pi-file-word';
      case 'CSV': return 'pi-file-excel';
      default: return 'pi-file';
    }
  }
}
