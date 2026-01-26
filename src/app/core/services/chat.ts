import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ChatRequest, ChatResponse, ChatMessage, Conversation } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/1.0/chat';
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly CONVERSATIONS_KEY = 'chat_conversations';

  private conversationsSignal = signal<Conversation[]>(this.loadConversations());
  conversations = this.conversationsSignal.asReadonly();

  ask(question: string, conversationId?: string): Observable<ChatResponse> {
    const headers = conversationId
      ? new HttpHeaders({ 'X-Conversation-Id': conversationId })
      : new HttpHeaders();

    const request: ChatRequest = { question };

    return this.http.post<ChatResponse>(`${this.apiUrl}/ask`, request, { headers });
  }

  createConversation(title: string, documentIds: number[]): Conversation {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      documentIds,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.conversationsSignal.update(convs => {
      const updated = [conversation, ...convs];
      this.saveConversations(updated);
      return updated;
    });

    return conversation;
  }

  addMessage(conversationId: string, message: ChatMessage): void {
    this.conversationsSignal.update(convs => {
      const updated = convs.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date()
          };
        }
        return conv;
      });
      this.saveConversations(updated);
      return updated;
    });
  }

  getConversation(conversationId: string): Conversation | undefined {
    return this.conversationsSignal().find(c => c.id === conversationId);
  }

  deleteConversation(conversationId: string): void {
    this.conversationsSignal.update(convs => {
      const updated = convs.filter(c => c.id !== conversationId);
      this.saveConversations(updated);
      return updated;
    });
  }

  clearAllConversations(): void {
    this.conversationsSignal.set([]);
    this.saveConversations([]);
  }

  private loadConversations(): Conversation[] {
    if (!this.isBrowser) return [];

    try {
      const data = localStorage.getItem(this.CONVERSATIONS_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return parsed.map((conv: Conversation) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch {
      return [];
    }
  }

  private saveConversations(conversations: Conversation[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations));
  }
}
