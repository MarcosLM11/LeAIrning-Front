import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse, ChatMessage, Conversation } from '../models/chat.model';
import { StorageService } from '../../shared/services/storage.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}/chat`;
  private readonly CONVERSATIONS_KEY = 'chat_conversations';

  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private conversationsSignal = signal<Conversation[]>(this.loadConversations());
  conversations = this.conversationsSignal.asReadonly();

  ask(question: string, conversationId?: string): Observable<ChatResponse> {
    const headers = conversationId
      ? new HttpHeaders({ 'X-Conversation-Id': conversationId })
      : new HttpHeaders();
    const request: ChatRequest = { question };
    return this.http.post<ChatResponse>(`${this.apiUrl}/ask`, request, { headers });
  }

  createConversation(title: string, documentIds: string[]): Conversation {
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
    const data = this.storage.get<Conversation[]>(this.CONVERSATIONS_KEY);
    if (!data) return [];

    return data.map(conv => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  }

  private saveConversations(conversations: Conversation[]): void {
    this.storage.set(this.CONVERSATIONS_KEY, conversations);
  }
}