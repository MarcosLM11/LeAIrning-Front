import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Chat } from './chat';
import { ChatService } from '../../../../core/services/chat';
import { DocumentService } from '../../../../core/services/document';
import { ToastService } from '../../../../shared/services/toast.service';

describe('Chat', () => {
  let mockChatService: {
    conversations: ReturnType<typeof signal>;
    loadConversations: ReturnType<typeof vi.fn>;
    loadMessages: ReturnType<typeof vi.fn>;
    createConversation: ReturnType<typeof vi.fn>;
    ask: ReturnType<typeof vi.fn>;
    addMessage: ReturnType<typeof vi.fn>;
    getConversation: ReturnType<typeof vi.fn>;
    deleteConversation: ReturnType<typeof vi.fn>;
    clearLocalState: ReturnType<typeof vi.fn>;
  };
  let mockDocumentService: { list: ReturnType<typeof vi.fn> };
  let mockToast: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockChatService = {
      conversations: signal([]),
      loadConversations: vi.fn().mockReturnValue(of([])),
      loadMessages: vi.fn().mockReturnValue(of([])),
      createConversation: vi.fn(),
      ask: vi.fn(),
      addMessage: vi.fn(),
      getConversation: vi.fn().mockReturnValue(null),
      deleteConversation: vi.fn().mockReturnValue(of(null)),
      clearLocalState: vi.fn(),
    };
    mockDocumentService = {
      list: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
    };
    mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ChatService, useValue: mockChatService },
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: ToastService, useValue: mockToast },
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
      ],
    });
  });

  function create() {
    const fixture = TestBed.createComponent(Chat);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should load documents and conversations on init', () => {
    create();
    expect(mockDocumentService.list).toHaveBeenCalled();
    expect(mockChatService.loadConversations).toHaveBeenCalled();
  });

  it('should start with no current conversation', () => {
    expect(create().componentInstance.currentConversation()).toBeNull();
  });

  it('should start new conversation by clearing state', () => {
    const comp = create().componentInstance;
    comp.messageText.set('hello');
    comp.startNewConversation();
    expect(comp.currentConversation()).toBeNull();
    expect(comp.messageText()).toBe('');
  });

  it('should toggle sidebar', () => {
    const comp = create().componentInstance;
    expect(comp.showSidebar()).toBe(true);
    comp.toggleSidebar();
    expect(comp.showSidebar()).toBe(false);
  });

  it('should compute canSend correctly', () => {
    const comp = create().componentInstance;
    expect(comp.canSend()).toBe(false);
    comp.messageText.set('hello');
    expect(comp.canSend()).toBe(true);
  });

  it('should compute messages from current conversation', () => {
    const comp = create().componentInstance;
    expect(comp.messages()).toEqual([]);
  });

  it('should not send empty message', async () => {
    const comp = create().componentInstance;
    comp.messageText.set('');
    await comp.sendMessage();
    expect(mockChatService.ask).not.toHaveBeenCalled();
  });

  it('should warn when no documents selected for new conversation', async () => {
    const comp = create().componentInstance;
    comp.messageText.set('hello');
    await comp.sendMessage();
    expect(mockToast.warning).toHaveBeenCalled();
  });
});
