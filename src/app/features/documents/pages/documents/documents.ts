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
import { MessageService, ConfirmationService } from 'primeng/api';
import { DocumentService } from '../../../../core/services/document';
import { Document, DocumentListParams } from '../../../../core/models/document.model';

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface SortOption {
  label: string;
  value: { field: string; order: 'asc' | 'desc' };
}

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'csv', 'doc', 'docx', 'md'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

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
  providers: [MessageService, ConfirmationService],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Documents implements OnInit {
  private documentService = inject(DocumentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  uploadFiles = signal<FileUpload[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);
  documents = signal<Document[]>([]);
  isLoading = signal(false);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  showDetailDialog = signal(false);
  selectedDocument = signal<Document | null>(null);
  searchQuery = signal('');
  sortField = signal<string>('createdTimestamp');
  sortOrder = signal<'asc' | 'desc'>('desc');
  selectedDocuments = signal<Set<string>>(new Set());
  isSelectionMode = signal(false);
  showQuickPreview = signal(false);
  previewDocument = signal<Document | null>(null);

  sortOptions: SortOption[] = [
    { label: 'Más recientes', value: { field: 'createdTimestamp', order: 'desc' } },
    { label: 'Más antiguos', value: { field: 'createdTimestamp', order: 'asc' } },
    { label: 'Nombre (A-Z)', value: { field: 'fileName', order: 'asc' } },
    { label: 'Nombre (Z-A)', value: { field: 'fileName', order: 'desc' } },
    { label: 'Mayor tamaño', value: { field: 'size', order: 'desc' } },
    { label: 'Menor tamaño', value: { field: 'size', order: 'asc' } }
  ];

  hasUploadFiles = computed(() => this.uploadFiles().length > 0);
  canUpload = computed(() => {
    const files = this.uploadFiles();
    return files.length > 0 && files.some(f => f.status === 'pending');
  });
  uploadProgress = computed(() => {
    const files = this.uploadFiles();
    if (files.length === 0) return 0;
    const total = files.reduce((sum, f) => sum + f.progress, 0);
    return Math.round(total / files.length);
  });

  filteredDocuments = computed(() => {
    const docs = this.documents();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return docs;
    return docs.filter(d => d.fileName.toLowerCase().includes(query));
  });

  selectedCount = computed(() => this.selectedDocuments().size);
  allSelected = computed(() => {
    const docs = this.filteredDocuments();
    const selected = this.selectedDocuments();
    return docs.length > 0 && docs.every(d => selected.has(d.id));
  });
  hasSelection = computed(() => this.selectedDocuments().size > 0);

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(showLoading = true): void {
    if (showLoading) {
      this.isLoading.set(true);
    }
    const params: DocumentListParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sort: `${this.sortField()},${this.sortOrder()}`
    };
    this.documentService.list(params).subscribe({
      next: (response) => {
        this.documents.set(response.content);
        this.totalRecords.set(response.totalElements);
        if (showLoading) {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los documentos'
        });
        if (showLoading) {
          this.isLoading.set(false);
        }
      }
    });
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.currentPage.set(Math.floor(first / rows));
    this.pageSize.set(rows);
    this.loadDocuments();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onSortChange(option: SortOption): void {
    this.sortField.set(option.value.field);
    this.sortOrder.set(option.value.order);
    this.currentPage.set(0);
    this.loadDocuments();
  }

  toggleSelectionMode(): void {
    this.isSelectionMode.update(v => !v);
    if (!this.isSelectionMode()) {
      this.selectedDocuments.set(new Set());
    }
  }

  toggleDocumentSelection(docId: string): void {
    this.selectedDocuments.update(current => {
      const newSet = new Set(current);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedDocuments.set(new Set());
    } else {
      const allIds = this.filteredDocuments().map(d => d.id);
      this.selectedDocuments.set(new Set(allIds));
    }
  }

  confirmBulkDelete(): void {
    const count = this.selectedCount();
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar ${count} documento(s)?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.bulkDelete()
    });
  }

  private bulkDelete(): void {
    const ids = Array.from(this.selectedDocuments());
    let deleted = 0;
    let failed = 0;
    const deletePromises = ids.map(id =>
      this.documentService.delete(id).toPromise()
        .then(() => { deleted++; })
        .catch(() => { failed++; })
    );
    Promise.all(deletePromises).then(() => {
      if (deleted > 0) {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminados',
          detail: `${deleted} documento(s) eliminado(s)`
        });
      }
      if (failed > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: `${failed} documento(s) no se pudieron eliminar`
        });
      }
      this.selectedDocuments.set(new Set());
      this.isSelectionMode.set(false);
      this.loadDocuments();
    });
  }

  openQuickPreview(doc: Document, event: Event): void {
    event.stopPropagation();
    this.previewDocument.set(doc);
    this.showQuickPreview.set(true);
  }

  closeQuickPreview(): void {
    this.showQuickPreview.set(false);
    this.previewDocument.set(null);
  }

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
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      this.addFiles(Array.from(droppedFiles));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private addFiles(newFiles: File[]): void {
    const validFiles: FileUpload[] = [];
    for (const file of newFiles) {
      const validation = this.validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          progress: 0,
          status: 'pending'
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo no válido',
          detail: `${file.name}: ${validation.error}`
        });
      }
    }
    if (validFiles.length > 0) {
      this.uploadFiles.update(current => [...current, ...validFiles]);
    }
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Tipo no permitido. Usa: ${ALLOWED_EXTENSIONS.join(', ')}`
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'Excede 50MB' };
    }
    return { valid: true };
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
    this.uploadFiles.update(current =>
      current.map(f => f.status === 'pending'
        ? { ...f, status: 'uploading' as const, progress: 10 }
        : f
      )
    );
    const progressInterval = setInterval(() => {
      this.uploadFiles.update(current =>
        current.map(f => {
          if (f.status === 'uploading' && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        })
      );
    }, 200);
    try {
      const filesToUpload = pendingFiles.map(f => f.file);
      await this.documentService.upload(filesToUpload).toPromise();
      clearInterval(progressInterval);
      this.uploadFiles.update(current =>
        current.map(f => {
          if (f.status === 'uploading') {
            return { ...f, status: 'success' as const, progress: 100 };
          }
          return f;
        })
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Subida completada',
        detail: `${pendingFiles.length} documento(s) subido(s)`
      });
      setTimeout(() => {
        this.uploadFiles.set([]);
        this.loadDocuments();
      }, 1500);
    } catch (error) {
      clearInterval(progressInterval);
      this.uploadFiles.update(current =>
        current.map(f => {
          if (f.status === 'uploading') {
            return { ...f, status: 'error' as const, progress: 0, errorMessage: 'Error al subir' };
          }
          return f;
        })
      );
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron subir los archivos'
      });
    } finally {
      this.isUploading.set(false);
    }
  }

  viewDetails(doc: Document): void {
    this.selectedDocument.set(doc);
    this.showDetailDialog.set(true);
  }

  closeDetailDialog(): void {
    this.showDetailDialog.set(false);
    this.selectedDocument.set(null);
  }

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
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: `"${doc.fileName}" eliminado correctamente`
        });
        this.loadDocuments();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el documento'
        });
      }
    });
  }

  goToChat(doc: Document): void {
    this.router.navigate(['/chat'], { queryParams: { documentId: doc.id } });
  }

  goToQuiz(doc: Document): void {
    this.router.navigate(['/quizzes/generate'], { queryParams: { documentId: doc.id } });
  }

  getTypeIcon(contentType: string): string {
    if (contentType.includes('pdf')) return 'pi-file-pdf';
    if (contentType.includes('word') || contentType.includes('document')) return 'pi-file-word';
    if (contentType.includes('csv') || contentType.includes('excel')) return 'pi-file-excel';
    return 'pi-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getUploadFileIcon(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pi-file-pdf';
      case 'doc':
      case 'docx': return 'pi-file-word';
      case 'csv': return 'pi-file-excel';
      default: return 'pi-file';
    }
  }
}