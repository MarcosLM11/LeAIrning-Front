import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  Conversation,
  ConversationCreateRequest,
  ConversationResponse,
  ConversationPage
} from '../models/chat.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly chatApiUrl = `${environment.apiUrl}/chat`;
  private readonly conversationsApiUrl = `${environment.apiUrl}/conversations`;

  private http = inject(HttpClient);

  // Local state for conversations with their messages (messages are kept in memory)
  private conversationsSignal = signal<Conversation[]>([]);
  conversations = this.conversationsSignal.asReadonly();

  /**
   * Load conversations from backend API.
   * Call this on component init.
   */
  loadConversations(): Observable<Conversation[]> {
    return this.http.get<ConversationPage>(this.conversationsApiUrl).pipe(
      map(page => page.content.map(this.toConversation)),
      tap(conversations => this.conversationsSignal.set(conversations))
    );
  }

  /**
   * Create a new conversation in the backend.
   */
  createConversation(title: string, documentIds: string[]): Observable<Conversation> {
    const request: ConversationCreateRequest = { title, documentIds };
    return this.http.post<ConversationResponse>(this.conversationsApiUrl, request).pipe(
      map(this.toConversation),
      tap(conversation => {
        this.conversationsSignal.update(convs => [conversation, ...convs]);
      })
    );
  }

  /**
   * Send a question to the chat API.
   */
  ask(question: string, conversationId: string): Observable<ChatResponse> {
    const headers = new HttpHeaders({ 'X-Conversation-Id': conversationId });
    const request: ChatRequest = { question };
    return this.http.post<ChatResponse>(`${this.chatApiUrl}/ask`, request, { headers });
  }

  /**
   * Add a message to the local conversation state.
   * Messages are kept in memory only.
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
      messages: [], // Messages are not persisted in backend
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt)
    };
  }
}
