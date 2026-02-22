import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DocumentSelector } from './document-selector';
import { Document } from '../../../core/models/document.model';

describe('DocumentSelector', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
  });

  const mockDocs: Document[] = [
    { id: '1', userId: 'u1', fileName: 'Doc 1', contentType: 'application/pdf', size: 100, storagePath: '/a' },
    { id: '2', userId: 'u1', fileName: 'Doc 2', contentType: 'application/pdf', size: 200, storagePath: '/b' },
  ];

  function create(docs: Document[] = mockDocs, selectedIds: string[] = []) {
    const fixture = TestBed.createComponent(DocumentSelector);
    fixture.componentRef.setInput('documents', docs);
    fixture.componentRef.setInput('selectedIds', selectedIds);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should compute hasDocuments correctly', () => {
    expect(create(mockDocs).componentInstance.hasDocuments()).toBe(true);
    expect(create([]).componentInstance.hasDocuments()).toBe(false);
  });

  it('should compute allSelected when all docs selected', () => {
    expect(create(mockDocs, ['1', '2']).componentInstance.allSelected()).toBe(true);
  });

  it('should compute allSelected as false when partial selection', () => {
    expect(create(mockDocs, ['1']).componentInstance.allSelected()).toBe(false);
  });

  it('should check if document is selected', () => {
    const comp = create(mockDocs, ['1']).componentInstance;
    expect(comp.isSelected('1')).toBe(true);
    expect(comp.isSelected('2')).toBe(false);
  });

  it('should emit toggleAll', () => {
    const fixture = create();
    const spy = vi.fn();
    fixture.componentInstance.toggleAll.subscribe(spy);
    fixture.componentInstance.onToggleAll();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit toggleDocument with doc id', () => {
    const fixture = create();
    const spy = vi.fn();
    fixture.componentInstance.toggleDocument.subscribe(spy);
    fixture.componentInstance.onToggleDocument('1');
    expect(spy).toHaveBeenCalledWith('1');
  });
});
