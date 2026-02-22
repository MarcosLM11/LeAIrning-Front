import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Documents } from './documents';
import { DocumentService } from '../../../../core/services/document';
import { ToastService } from '../../../../shared/services/toast.service';

describe('Documents', () => {
  let mockDocumentService: {
    list: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    upload: ReturnType<typeof vi.fn>;
    download: ReturnType<typeof vi.fn>;
  };
  let mockToast: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDocumentService = {
      list: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
      delete: vi.fn().mockReturnValue(of(null)),
      upload: vi.fn().mockReturnValue(of(null)),
      download: vi.fn().mockReturnValue(of(new Blob())),
    };
    mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: ToastService, useValue: mockToast },
        ConfirmationService,
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
      ],
    });
  });

  function create() {
    const fixture = TestBed.createComponent(Documents);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should load documents on init', () => {
    create();
    expect(mockDocumentService.list).toHaveBeenCalled();
  });

  it('should toggle selection mode', () => {
    const comp = create().componentInstance;
    expect(comp.isSelectionMode()).toBe(false);
    comp.toggleSelectionMode();
    expect(comp.isSelectionMode()).toBe(true);
    comp.toggleSelectionMode();
    expect(comp.isSelectionMode()).toBe(false);
  });

  it('should toggle document selection', () => {
    const comp = create().componentInstance;
    comp.toggleDocumentSelection('doc-1');
    expect(comp.selectedDocuments().has('doc-1')).toBe(true);
    comp.toggleDocumentSelection('doc-1');
    expect(comp.selectedDocuments().has('doc-1')).toBe(false);
  });

  it('should filter documents by search query', () => {
    const comp = create().componentInstance;
    comp.documents.set([
      { id: '1', fileName: 'Angular Guide.pdf', contentType: 'application/pdf', size: 100 } as any,
      { id: '2', fileName: 'React Intro.pdf', contentType: 'application/pdf', size: 200 } as any,
    ]);
    comp.onSearchChange('angular');
    expect(comp.filteredDocuments().length).toBe(1);
    expect(comp.filteredDocuments()[0].fileName).toBe('Angular Guide.pdf');
  });

  it('should clear search', () => {
    const comp = create().componentInstance;
    comp.searchQuery.set('test');
    comp.clearSearch();
    expect(comp.searchQuery()).toBe('');
  });

  it('should navigate to chat with document', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const doc = { id: 'doc-1', fileName: 'test.pdf' } as any;
    create().componentInstance.goToChat(doc);
    expect(navigateSpy).toHaveBeenCalledWith(['/chat'], { queryParams: { documentId: 'doc-1' } });
  });

  it('should navigate to quiz with document', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const doc = { id: 'doc-1' } as any;
    create().componentInstance.goToQuiz(doc);
    expect(navigateSpy).toHaveBeenCalledWith(['/quizzes/generate'], { queryParams: { documentId: 'doc-1' } });
  });

  it('should open and close quick preview', () => {
    const comp = create().componentInstance;
    const doc = { id: '1', fileName: 'test.pdf' } as any;
    comp.openQuickPreview(doc);
    expect(comp.showQuickPreview()).toBe(true);
    expect(comp.previewDocument()).toBe(doc);
    comp.closeQuickPreview();
    expect(comp.showQuickPreview()).toBe(false);
    expect(comp.previewDocument()).toBeNull();
  });

  it('should view document info toast', () => {
    create().componentInstance.viewDocument({ id: '1', fileName: 'test.pdf' } as any);
    expect(mockToast.info).toHaveBeenCalled();
  });
});
