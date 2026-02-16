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
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
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
  private route = inject(ActivatedRoute);

  // Document selection
  readonly documentSelection = new SelectionManager<Document>();

  // State
  documents = signal<Document[]>([]);
  currentConversation = signal<Conversation | null>(null);
  messageText = signal('');
  isLoadingDocs = signal(true);
  isLoadingConversations = signal(true);
  isLoadingMessages = signal(false);
  isCreatingConversation = signal(false);
  // Tracks which conversation is currently waiting for a response
  sendingConversationId = signal<string | null>(null);
  showSidebar = signal(true);

  private shouldScrollToBottom = false;

  // Computed
  conversations = this.chatService.conversations;
  messages = computed(() => this.currentConversation()?.messages ?? []);
  hasDocuments = computed(() => this.documents().length > 0);
  allSelected = this.documentSelection.allSelected;
  selectedDocumentIds = computed(() => this.documentSelection.getSelectedIds());

  // Computed for backward compatibility and global blocking
  isSending = computed(() => !!this.sendingConversationId());

  canSend = computed(() =>
    this.messageText().trim().length > 0 &&
    !this.isSending() &&
    !this.isCreatingConversation() &&
    !this.isLoadingMessages()
  );

  // Re-export utils for template
  formatTime = formatTime;
  formatDate = formatDateTime;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private async loadData(): Promise<void> {
    // Load documents and conversations in parallel
    await Promise.all([
      this.loadDocuments(),
      this.loadConversations()
    ]);
  }

  private async loadDocuments(): Promise<void> {
    this.isLoadingDocs.set(true);
    try {
      const response = await firstValueFrom(this.documentService.list({ size: 100 }));
      const docs = response?.content ?? [];
      this.documents.set(docs);
      this.documentSelection.setItems(docs);

      // Check if there's a documentId in query params
      const documentIdFromRoute = this.route.snapshot.queryParams['documentId'];
      if (documentIdFromRoute && docs.some(d => d.id === documentIdFromRoute)) {
        // Select only the document from the route
        this.documentSelection.setSelectedIds([documentIdFromRoute]);
      } else if (docs.length > 0) {
        // Select all documents by default only if no specific document requested
        this.documentSelection.selectAll();
      }
    } catch {
      this.toast.error('No se pudieron cargar los documentos');
    } finally {
      this.isLoadingDocs.set(false);
    }
  }

  private async loadConversations(): Promise<void> {
    this.isLoadingConversations.set(true);
    try {
      await firstValueFrom(this.chatService.loadConversations());

      const conversationId = this.route.snapshot.queryParams['conversationId'];
      if (conversationId) {
        const conv = this.conversations().find(c => c.id === conversationId);
        if (conv) {
          this.selectConversation(conv);
        }
      }
    } catch {
      this.toast.error('No se pudieron cargar las conversaciones');
    } finally {
      this.isLoadingConversations.set(false);
    }
  }

  toggleSelectAll(): void {
    this.documentSelection.toggleAll();
  }

  toggleDocument(docId: string): void {
    this.documentSelection.toggle(docId);
  }

  /**
   * Prepares for a new conversation by clearing the current one.
   * The conversation will be created when the user sends the first message,
   * using that message as the title.
   */
  startNewConversation(): void {
    this.currentConversation.set(null);
    this.messageText.set('');
  }

  async selectConversation(conversation: Conversation): Promise<void> {
    this.currentConversation.set(conversation);
    this.documentSelection.setSelectedIds(conversation.documentIds);

    // Load messages from backend if not already loaded
    if (!conversation.messagesLoaded) {
      await this.loadMessagesForConversation(conversation.id);
    }

    this.shouldScrollToBottom = true;
  }

  private async loadMessagesForConversation(conversationId: string): Promise<void> {
    this.isLoadingMessages.set(true);
    try {
      await firstValueFrom(this.chatService.loadMessages(conversationId));
      // Refresh current conversation to get updated messages
      this.refreshCurrentConversation(conversationId);
    } catch {
      this.toast.error('No se pudieron cargar los mensajes');
    } finally {
      this.isLoadingMessages.set(false);
      this.shouldScrollToBottom = true;
    }
  }

  async deleteConversation(conversation: Conversation, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await firstValueFrom(this.chatService.deleteConversation(conversation.id));
      if (this.currentConversation()?.id === conversation.id) {
        this.currentConversation.set(null);
      }
    } catch {
      this.toast.error('No se pudo eliminar la conversación');
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.messageText().trim();
    if (!text || this.isSending() || this.isCreatingConversation() || this.isLoadingMessages()) return;

    let conversation = this.currentConversation();

    // If no conversation, create one first
    if (!conversation) {
      if (this.selectedDocumentIds().length === 0) {
        this.toast.warning('Debes seleccionar al menos un documento para chatear', 'Selecciona documentos');
        return;
      }

      this.isCreatingConversation.set(true);
      try {
        const title = text.length > 50 ? `${text.substring(0, 50)}...` : text;
        conversation = await firstValueFrom(
          this.chatService.createConversation(title, this.selectedDocumentIds())
        );
        this.currentConversation.set(conversation);
      } catch {
        this.toast.error('No se pudo crear la conversación');
        this.isCreatingConversation.set(false);
        return;
      } finally {
        this.isCreatingConversation.set(false);
      }
    }

    // Add user message locally
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
    this.sendingConversationId.set(conversation.id);

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
      this.sendingConversationId.set(null);
    }
  }

  private refreshCurrentConversation(conversationId: string): void {
    // Only update if the user is still viewing the same conversation
    if (this.currentConversation()?.id === conversationId) {
      this.currentConversation.set(this.chatService.getConversation(conversationId) ?? null);
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



  private scrollToBottom(): void {
    const container = this.messagesContainer?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
