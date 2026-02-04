import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { DocumentService } from '../../../../core/services/document';
import { Document, DocumentListParams } from '../../../../core/models/document.model';
import {
  validateFile,
  formatFileSize,
  getDocumentIcon,
  getFileIcon
} from '../../../../shared/utils/file.utils';
import { FileUpload } from '../../../../shared/models/file-upload.model';
import { ToastService } from '../../../../shared/services/toast.service';

interface SortOption {
  label: string;
  value: { field: string; order: 'asc' | 'desc' };
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Más recientes', value: { field: 'createdTimestamp', order: 'desc' } },
  { label: 'Más antiguos', value: { field: 'createdTimestamp', order: 'asc' } },
  { label: 'Nombre (A-Z)', value: { field: 'fileName', order: 'asc' } },
  { label: 'Nombre (Z-A)', value: { field: 'fileName', order: 'desc' } },
  { label: 'Mayor tamaño', value: { field: 'size', order: 'desc' } },
  { label: 'Menor tamaño', value: { field: 'size', order: 'asc' } }
];

@Component({
  selector: 'app-documents',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    ProgressBarModule,
    TooltipModule,
    InputTextModule,
    PaginatorModule
  ],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Documents implements OnInit {
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  // Document list state
  documents = signal<Document[]>([]);
  isLoading = signal(false);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  searchQuery = signal('');
  sortField = signal('createdTimestamp');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Selection state
  selectedDocuments = signal<Set<string>>(new Set());
  isSelectionMode = signal(false);

  // Dialog state
  showDetailDialog = signal(false);
  selectedDocument = signal<Document | null>(null);
  showQuickPreview = signal(false);
  previewDocument = signal<Document | null>(null);

  // Upload state
  uploadFiles = signal<FileUpload[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);

  // Constants
  readonly sortOptions = SORT_OPTIONS;

  // Computed: Upload
  hasUploadFiles = computed(() => this.uploadFiles().length > 0);
  canUpload = computed(() => this.uploadFiles().some(f => f.status === 'pending'));
  uploadProgress = computed(() => {
    const files = this.uploadFiles();
    if (files.length === 0) return 0;
    return Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length);
  });

  // Computed: Documents
  filteredDocuments = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.documents();
    return this.documents().filter(d => d.fileName.toLowerCase().includes(query));
  });

  // Computed: Selection
  selectedCount = computed(() => this.selectedDocuments().size);
  hasSelection = computed(() => this.selectedDocuments().size > 0);
  allSelected = computed(() => {
    const docs = this.filteredDocuments();
    const selected = this.selectedDocuments();
    return docs.length > 0 && docs.every(d => selected.has(d.id));
  });

  // Re-export utils for template
  formatFileSize = formatFileSize;
  getTypeIcon = getDocumentIcon;
  getUploadFileIcon = (file: File) => getFileIcon(file.name);

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(showLoading = true): void {
    if (showLoading) this.isLoading.set(true);

    const params: DocumentListParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sort: `${this.sortField()},${this.sortOrder()}`
    };

    this.documentService.list(params).subscribe({
      next: (response) => {
        this.documents.set(response.content);
        this.totalRecords.set(response.totalElements);
        if (showLoading) this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('No se pudieron cargar los documentos');
        if (showLoading) this.isLoading.set(false);
      }
    });
  }

  // Pagination
  onPageChange(event: { first?: number; rows?: number }): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.currentPage.set(Math.floor(first / rows));
    this.pageSize.set(rows);
    this.loadDocuments();
  }

  // Search
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  // Sort
  onSortChange(option: SortOption): void {
    this.sortField.set(option.value.field);
    this.sortOrder.set(option.value.order);
    this.currentPage.set(0);
    this.loadDocuments();
  }

  // Selection
  toggleSelectionMode(): void {
    this.isSelectionMode.update(v => !v);
    if (!this.isSelectionMode()) this.selectedDocuments.set(new Set());
  }

  toggleDocumentSelection(docId: string): void {
    this.selectedDocuments.update(current => {
      const newSet = new Set(current);
      newSet.has(docId) ? newSet.delete(docId) : newSet.add(docId);
      return newSet;
    });
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedDocuments.set(new Set());
    } else {
      this.selectedDocuments.set(new Set(this.filteredDocuments().map(d => d.id)));
    }
  }

  // Bulk delete
  confirmBulkDelete(): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar ${this.selectedCount()} documento(s)?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.bulkDelete()
    });
  }

  private async bulkDelete(): Promise<void> {
    const ids = Array.from(this.selectedDocuments());
    const results = await Promise.allSettled(
      ids.map(id => firstValueFrom(this.documentService.delete(id)))
    );

    const deleted = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    if (deleted > 0) this.toast.success(`${deleted} documento(s) eliminado(s)`);
    if (failed > 0) this.toast.warning(`${failed} documento(s) no se pudieron eliminar`);

    this.selectedDocuments.set(new Set());
    this.isSelectionMode.set(false);
    this.loadDocuments();
  }

  // Quick preview
  openQuickPreview(doc: Document, event: Event): void {
    event.stopPropagation();
    this.previewDocument.set(doc);
    this.showQuickPreview.set(true);
  }

  closeQuickPreview(): void {
    this.showQuickPreview.set(false);
    this.previewDocument.set(null);
  }

  // Drag & Drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private addFiles(files: File[]): void {
    for (const file of files) {
      const validation = validateFile(file);
      if (validation.valid) {
        this.uploadFiles.update(current => [...current, { file, progress: 0, status: 'pending' }]);
      } else {
        this.toast.error(`${file.name}: ${validation.error}`, 'Archivo no válido');
      }
    }
  }

  removeUploadFile(index: number): void {
    this.uploadFiles.update(current => current.filter((_, i) => i !== index));
  }

  clearUploadFiles(): void {
    this.uploadFiles.set([]);
  }

  async startUpload(): Promise<void> {
    const pendingFiles = this.uploadFiles().filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    this.isUploading.set(true);
    this.updateUploadStatus('pending', 'uploading', 10);

    const progressInterval = setInterval(() => {
      this.uploadFiles.update(current =>
        current.map(f => f.status === 'uploading' && f.progress < 90
          ? { ...f, progress: f.progress + 10 }
          : f
        )
      );
    }, 200);

    try {
      await firstValueFrom(this.documentService.upload(pendingFiles.map(f => f.file)));
      clearInterval(progressInterval);
      this.updateUploadStatus('uploading', 'success', 100);
      this.toast.success(`${pendingFiles.length} documento(s) subido(s)`, 'Subida completada');
      setTimeout(() => {
        this.uploadFiles.set([]);
        this.loadDocuments();
      }, 1500);
    } catch {
      clearInterval(progressInterval);
      this.uploadFiles.update(current =>
        current.map(f => f.status === 'uploading'
          ? { ...f, status: 'error' as const, progress: 0, errorMessage: 'Error al subir' }
          : f
        )
      );
      this.toast.error('No se pudieron subir los archivos');
    } finally {
      this.isUploading.set(false);
    }
  }

  private updateUploadStatus(from: FileUpload['status'], to: FileUpload['status'], progress: number): void {
    this.uploadFiles.update(current =>
      current.map(f => f.status === from ? { ...f, status: to, progress } : f)
    );
  }

  // Document details
  viewDetails(doc: Document): void {
    this.selectedDocument.set(doc);
    this.showDetailDialog.set(true);
  }

  closeDetailDialog(): void {
    this.showDetailDialog.set(false);
    this.selectedDocument.set(null);
  }

  // Delete single document
  confirmDelete(doc: Document): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${doc.fileName}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteDocument(doc)
    });
  }

  private deleteDocument(doc: Document): void {
    this.documentService.delete(doc.id).subscribe({
      next: () => {
        this.toast.success(`"${doc.fileName}" eliminado correctamente`, 'Eliminado');
        this.loadDocuments();
      },
      error: () => this.toast.error('No se pudo eliminar el documento')
    });
  }

  // Navigation
  goToChat(doc: Document): void {
    this.router.navigate(['/chat'], { queryParams: { documentId: doc.id } });
  }

  goToQuiz(doc: Document): void {
    this.router.navigate(['/quizzes/generate'], { queryParams: { documentId: doc.id } });
  }
}
