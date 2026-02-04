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
import { MessageService } from 'primeng/api';
import { DocumentSelector } from '../../../../shared/components/document-selector/document-selector';
import { firstValueFrom } from 'rxjs';
import { ChatService } from '../../../../core/services/chat';
import { DocumentService } from '../../../../core/services/document';
import { ChatMessage, Conversation } from '../../../../core/models/chat.model';
import { Document } from '../../../../core/models/document.model';
import { formatTime, formatDateTime } from '../../../../shared/utils/date.utils';
import { SelectionManager } from '../../../../shared/utils/selection.utils';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule, DocumentSelector],
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
  private toast = inject(ToastService);
  private router = inject(Router);

  // Document selection
  readonly documentSelection = new SelectionManager<Document>();

  // State
  documents = signal<Document[]>([]);
  currentConversation = signal<Conversation | null>(null);
  messageText = signal('');
  isLoadingDocs = signal(true);
  isSending = signal(false);
  showSidebar = signal(true);

  private shouldScrollToBottom = false;

  // Computed
  conversations = this.chatService.conversations;
  messages = computed(() => this.currentConversation()?.messages ?? []);
  hasDocuments = computed(() => this.documents().length > 0);
  allSelected = this.documentSelection.allSelected;
  selectedDocumentIds = computed(() => this.documentSelection.getSelectedIds());

  canSend = computed(() =>
    this.messageText().trim().length > 0 && !this.isSending()
  );

  // Re-export utils for template
  formatTime = formatTime;
  formatDate = formatDateTime;

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
      const response = await firstValueFrom(this.documentService.list({ size: 100 }));
      const docs = response?.content ?? [];
      this.documents.set(docs);
      this.documentSelection.setItems(docs);

      // Select all documents by default
      if (docs.length > 0) {
        this.documentSelection.selectAll();
      }
    } catch {
      this.toast.error('No se pudieron cargar los documentos');
    } finally {
      this.isLoadingDocs.set(false);
    }
  }

  toggleSelectAll(): void {
    this.documentSelection.toggleAll();
  }

  toggleDocument(docId: string): void {
    this.documentSelection.toggle(docId);
  }

  startNewConversation(): void {
    if (this.selectedDocumentIds().length === 0) {
      this.toast.warning('Debes seleccionar al menos un documento para chatear', 'Selecciona documentos');
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
    this.documentSelection.setSelectedIds(conversation.documentIds);
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

    if (!conversation) {
      if (this.selectedDocumentIds().length === 0) {
        this.toast.warning('Debes seleccionar al menos un documento para chatear', 'Selecciona documentos');
        return;
      }
      const title = text.length > 50 ? `${text.substring(0, 50)}...` : text;
      conversation = this.chatService.createConversation(title, this.selectedDocumentIds());
      this.currentConversation.set(conversation);
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    this.chatService.addMessage(conversation.id, userMessage);
    this.refreshCurrentConversation(conversation.id);
    this.messageText.set('');
    this.shouldScrollToBottom = true;
    this.isSending.set(true);

    try {
      const response = await firstValueFrom(this.chatService.ask(text, conversation.id));
      if (response) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(response.timestamp)
        };
        this.chatService.addMessage(conversation.id, assistantMessage);
        this.refreshCurrentConversation(conversation.id);
        this.shouldScrollToBottom = true;
      }
    } catch {
      this.toast.error('No se pudo enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      this.isSending.set(false);
    }
  }

  private refreshCurrentConversation(conversationId: string): void {
    this.currentConversation.set(this.chatService.getConversation(conversationId) ?? null);
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
    const container = this.messagesContainer?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
