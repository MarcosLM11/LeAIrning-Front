import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { AuthService } from '../../../../core/services/auth';
import { DocumentService } from '../../../../core/services/document';
import { ChatService } from '../../../../core/services/chat';

describe('Dashboard', () => {
  let mockAuthService: { currentUser: ReturnType<typeof signal> };
  let mockDocumentService: { list: ReturnType<typeof vi.fn> };
  let mockChatService: {
    conversations: ReturnType<typeof signal>;
    loadConversations: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAuthService = { currentUser: signal({ id: '1', name: 'Test', email: 'e@t.com' }) };
    mockDocumentService = {
      list: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
    };
    mockChatService = {
      conversations: signal([]),
      loadConversations: vi.fn().mockReturnValue(of([])),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: ChatService, useValue: mockChatService },
      ],
    });
  });

  function create() {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should compute current user name', () => {
    expect(create().componentInstance.currentUser().name).toBe('Test');
  });

  it('should show suggestion for no documents', () => {
    expect(create().componentInstance.aiSuggestion()).toContain('Sube tu primer documento');
  });

  it('should call loadDocuments and loadConversations on init', () => {
    create();
    expect(mockDocumentService.list).toHaveBeenCalled();
    expect(mockChatService.loadConversations).toHaveBeenCalled();
  });

  it('should navigate when navigateTo is called', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    create().componentInstance.navigateTo('/chat');
    expect(navigateSpy).toHaveBeenCalledWith(['/chat']);
  });

  it('should not navigate when route is null', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    create().componentInstance.navigateTo(null);
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
