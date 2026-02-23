import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ChatService } from './chat';
import { environment } from '../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  const chatUrl = `${environment.apiUrl}/chat`;
  const convUrl = `${environment.apiUrl}/conversations`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty conversations', () => {
    expect(service.conversations()).toEqual([]);
  });

  it('should load conversations and set signal', () => {
    const response = {
      content: [
        { id: 'c-1', title: 'Conv 1', documentIds: ['d-1'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      ],
    };
    service.loadConversations().subscribe(convs => {
      expect(convs).toHaveLength(1);
      expect(convs[0].id).toBe('c-1');
    });
    httpMock.expectOne(convUrl).flush(response);
    expect(service.conversations()).toHaveLength(1);
  });

  it('should preserve existing messages when merging conversations', () => {
    // First load
    service.loadConversations().subscribe();
    httpMock.expectOne(convUrl).flush({
      content: [{ id: 'c-1', title: 'T', documentIds: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    });

    // Add a message locally
    service.addMessage('c-1', { id: 'm-1', role: 'user', content: 'Hello', timestamp: new Date() });

    // Reload — should preserve messages
    service.loadConversations().subscribe();
    httpMock.expectOne(convUrl).flush({
      content: [{ id: 'c-1', title: 'T updated', documentIds: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' }],
    });

    const conv = service.getConversation('c-1');
    expect(conv!.messages).toHaveLength(1);
    expect(conv!.messages[0].content).toBe('Hello');
  });

  it('should load messages for a conversation', () => {
    // Setup conversation first
    service.loadConversations().subscribe();
    httpMock.expectOne(convUrl).flush({
      content: [{ id: 'c-1', title: 'T', documentIds: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    });

    service.loadMessages('c-1').subscribe(msgs => {
      expect(msgs).toHaveLength(1);
    });
    httpMock.expectOne(`${convUrl}/c-1/messages`).flush([
      { id: 'm-1', role: 'user', content: 'Hi', timestamp: '2024-01-01T00:00:00Z' },
    ]);

    const conv = service.getConversation('c-1');
    expect(conv!.messagesLoaded).toBe(true);
    expect(conv!.messages).toHaveLength(1);
  });

  it('should create conversation and prepend to signal', () => {
    service.createConversation('New Chat', ['d-1']).subscribe(conv => {
      expect(conv.id).toBe('c-new');
    });
    httpMock.expectOne(r => r.url === convUrl && r.method === 'POST').flush({
      id: 'c-new', title: 'New Chat', documentIds: ['d-1'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
    });
    expect(service.conversations()).toHaveLength(1);
    expect(service.conversations()[0].id).toBe('c-new');
  });

  it('should send ask request with conversation header', () => {
    service.ask('What is AI?', 'c-1').subscribe();
    const req = httpMock.expectOne(`${chatUrl}/ask`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('X-Conversation-Id')).toBe('c-1');
    expect(req.request.body).toEqual({ question: 'What is AI?', language: 'es' });
    req.flush({ answer: 'AI is...', conversationId: 'c-1', timestamp: '2024-01-01T00:00:00Z' });
  });

  it('should add message to local state', () => {
    service.loadConversations().subscribe();
    httpMock.expectOne(convUrl).flush({
      content: [{ id: 'c-1', title: 'T', documentIds: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    });
    service.addMessage('c-1', { id: 'm-1', role: 'user', content: 'test', timestamp: new Date() });
    expect(service.getConversation('c-1')!.messages).toHaveLength(1);
  });

  it('should return undefined for non-existent conversation', () => {
    expect(service.getConversation('nonexistent')).toBeUndefined();
  });

  it('should delete conversation and remove from signal', () => {
    service.loadConversations().subscribe();
    httpMock.expectOne(convUrl).flush({
      content: [{ id: 'c-1', title: 'T', documentIds: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    });
    service.deleteConversation('c-1').subscribe();
    httpMock.expectOne(`${convUrl}/c-1`).flush(null);
    expect(service.conversations()).toHaveLength(0);
  });

  it('should update conversation title', () => {
    service.loadConversations().subscribe();
    httpMock.expectOne(convUrl).flush({
      content: [{ id: 'c-1', title: 'Old', documentIds: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    });
    service.updateTitle('c-1', 'New Title').subscribe();
    httpMock.expectOne(r => r.url === `${convUrl}/c-1` && r.method === 'PATCH').flush({
      id: 'c-1', title: 'New Title', documentIds: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z',
    });
    expect(service.getConversation('c-1')!.title).toBe('New Title');
  });

  it('should clear local state', () => {
    service.loadConversations().subscribe();
    httpMock.expectOne(convUrl).flush({
      content: [{ id: 'c-1', title: 'T', documentIds: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    });
    service.clearLocalState();
    expect(service.conversations()).toHaveLength(0);
  });
});
