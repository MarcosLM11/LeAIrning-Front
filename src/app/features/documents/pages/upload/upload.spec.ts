import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Upload } from './upload';
import { DocumentService } from '../../../../core/services/document';
import { ToastService } from '../../../../shared/services/toast.service';

describe('Upload', () => {
  let mockDocumentService: { upload: ReturnType<typeof vi.fn> };
  let mockToast: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockDocumentService = { upload: vi.fn().mockReturnValue(of(null)) };
    mockToast = { success: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: ToastService, useValue: mockToast },
        MessageService,
      ],
    });
  });

  function create() {
    const fixture = TestBed.createComponent(Upload);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should start with no files', () => {
    const comp = create().componentInstance;
    expect(comp.hasFiles()).toBe(false);
    expect(comp.canUpload()).toBe(false);
  });

  it('should remove file by index', () => {
    const comp = create().componentInstance;
    const file = new File(['x'], 'test.pdf', { type: 'application/pdf' });
    comp.files.set([{ file, progress: 0, status: 'pending' }]);
    comp.removeFile(0);
    expect(comp.files().length).toBe(0);
  });

  it('should clear all files', () => {
    const comp = create().componentInstance;
    const file = new File(['x'], 'test.pdf', { type: 'application/pdf' });
    comp.files.set([{ file, progress: 0, status: 'pending' }]);
    comp.clearAll();
    expect(comp.files().length).toBe(0);
  });

  it('should navigate back to dashboard', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    create().componentInstance.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should compute upload progress', () => {
    const comp = create().componentInstance;
    const file = new File(['x'], 'test.pdf', { type: 'application/pdf' });
    comp.files.set([
      { file, progress: 50, status: 'uploading' },
      { file, progress: 100, status: 'success' },
    ]);
    expect(comp.uploadProgress()).toBe(75);
  });
});
