import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  ChatMessageResponse,
  Conversation,
  ConversationCreateRequest,
  ConversationResponse,
  ConversationPage
} from '../models/chat.model';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly chatApiUrl = `${environment.apiUrl}/chat`;
  private readonly conversationsApiUrl = `${environment.apiUrl}/conversations`;

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  // Local state for conversations with their messages
  private conversationsSignal = signal<Conversation[]>([]);
  conversations = this.conversationsSignal.asReadonly();

  /**
   * Load conversations from backend API.
   * Preserves existing messages for conversations that are already loaded.
   */
  loadConversations(): Observable<Conversation[]> {
    return this.http.get<ConversationPage>(this.conversationsApiUrl).pipe(
      map(page => this.mergeConversations(page.content)),
      tap(conversations => this.conversationsSignal.set(conversations))
    );
  }

  /**
   * Merge new conversation data from backend with existing local state.
   * Preserves messages that were already loaded.
   */
  private mergeConversations(responses: ConversationResponse[]): Conversation[] {
    const existingConversations = this.conversationsSignal();
    const existingMap = new Map(existingConversations.map(c => [c.id, c]));

    return responses.map(response => {
      const existing = existingMap.get(response.id);
      if (existing) {
        // Preserve messages and messagesLoaded flag from existing conversation
        return {
          ...this.toConversation(response),
          messages: existing.messages,
          messagesLoaded: existing.messagesLoaded
        };
      }
      return this.toConversation(response);
    });
  }

  /**
   * Load messages for a conversation from the backend.
   */
  loadMessages(conversationId: string): Observable<ChatMessage[]> {
    return this.http
      .get<ChatMessageResponse[]>(`${this.conversationsApiUrl}/${conversationId}/messages`)
      .pipe(
        map(responses => responses.map(this.toChatMessage)),
        tap(messages => {
          this.conversationsSignal.update(convs =>
            convs.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  messages,
                  messagesLoaded: true
                };
              }
              return conv;
            })
          );
        })
      );
  }

  /**
   * Create a new conversation in the backend.
   */
  createConversation(title: string, documentIds: string[]): Observable<Conversation> {
    const request: ConversationCreateRequest = { title, documentIds };
    return this.http.post<ConversationResponse>(this.conversationsApiUrl, request).pipe(
      map(response => ({ ...this.toConversation(response), messagesLoaded: true })),
      tap(conversation => {
        this.conversationsSignal.update(convs => [conversation, ...convs]);
      })
    );
  }

  /**
   * Send a question to the chat API.
   */
  ask(question: string, conversationId: string): Observable<ChatResponse> {
    const language = this.translate.currentLang || this.translate.defaultLang || 'es';
    const headers = new HttpHeaders({
      'X-Conversation-Id': conversationId,
      'Accept-Language': language
    });
    const request: ChatRequest = { question, language };
    return this.http.post<ChatResponse>(`${this.chatApiUrl}/ask`, request, { headers });
  }

  /**
   * Add a message to the local conversation state.
   */
  addMessage(conversationId: string, message: ChatMessage): void {
    this.conversationsSignal.update(convs =>
      convs.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date()
          };
        }
        return conv;
      })
    );
  }

  /**
   * Get a conversation by ID from local state.
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversationsSignal().find(c => c.id === conversationId);
  }

  /**
   * Delete a conversation from the backend.
   */
  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.conversationsApiUrl}/${conversationId}`).pipe(
      tap(() => {
        this.conversationsSignal.update(convs =>
          convs.filter(c => c.id !== conversationId)
        );
      })
    );
  }

  /**
   * Update conversation title in the backend.
   */
  updateTitle(conversationId: string, title: string): Observable<Conversation> {
    return this.http.patch<ConversationResponse>(
      `${this.conversationsApiUrl}/${conversationId}`,
      { title }
    ).pipe(
      map(this.toConversation),
      tap(updated => {
        this.conversationsSignal.update(convs =>
          convs.map(c => c.id === updated.id ? { ...c, title: updated.title } : c)
        );
      })
    );
  }

  /**
   * Clear local state (useful for logout).
   */
  clearLocalState(): void {
    this.conversationsSignal.set([]);
  }

  /**
   * Convert backend response to client-side model.
   */
  private toConversation(response: ConversationResponse): Conversation {
    return {
      id: response.id,
      title: response.title,
      documentIds: response.documentIds,
      messages: [],
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      messagesLoaded: false
    };
  }

  /**
   * Convert backend message response to client-side model.
   */
  private toChatMessage(response: ChatMessageResponse): ChatMessage {
    return {
      id: response.id,
      role: response.role as 'user' | 'assistant',
      content: response.content,
      timestamp: new Date(response.timestamp)
    };
  }
}
