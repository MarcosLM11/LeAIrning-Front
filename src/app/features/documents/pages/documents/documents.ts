import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DocumentService } from '../../../../core/services/document';
import {
  Document,
  ProcessingStatus,
  DocumentType,
  DocumentListParams
} from '../../../../core/models/document.model';

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface StatusOption {
  label: string;
  value: ProcessingStatus | null;
}

interface TypeOption {
  label: string;
  value: DocumentType | null;
}

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'csv', 'doc', 'docx', 'md'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Component({
  selector: 'app-documents',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    ProgressBarModule,
    TooltipModule,
    InputTextModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Documents implements OnInit, OnDestroy {
  private documentService = inject(DocumentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  // Upload state
  uploadFiles = signal<FileUpload[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);

  // Documents list state
  documents = signal<Document[]>([]);
  isLoading = signal(false);
  totalRecords = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);

  // Filters
  selectedStatus = signal<ProcessingStatus | null>(null);
  selectedType = signal<DocumentType | null>(null);

  // Detail dialog
  showDetailDialog = signal(false);
  selectedDocument = signal<Document | null>(null);

  // Polling interval for processing documents
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  statusOptions: StatusOption[] = [
    { label: 'Todos los estados', value: null },
    { label: 'Subido', value: 'UPLOADED' },
    { label: 'Procesando', value: 'PROCESSING' },
    { label: 'Completado', value: 'COMPLETED' },
    { label: 'Fallido', value: 'FAILED' }
  ];

  typeOptions: TypeOption[] = [
    { label: 'Todos los tipos', value: null },
    { label: 'PDF', value: 'PDF' },
    { label: 'TXT', value: 'TXT' },
    { label: 'CSV', value: 'CSV' },
    { label: 'DOC', value: 'DOC' },
    { label: 'DOCX', value: 'DOCX' },
    { label: 'Markdown', value: 'MARKDOWN' }
  ];

  // Computed
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
  hasProcessingDocuments = computed(() =>
    this.documents().some(d => d.status === 'PROCESSING' || d.status === 'UPLOADED')
  );

  ngOnInit(): void {
    this.loadDocuments();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ============ DOCUMENTS LIST ============

  loadDocuments(): void {
    this.isLoading.set(true);

    const params: DocumentListParams = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    const status = this.selectedStatus();
    const type = this.selectedType();

    if (status) params.status = status;
    if (type) params.type = type;

    this.documentService.list(params).subscribe({
      next: (response) => {
        this.documents.set(response.content);
        this.totalRecords.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los documentos'
        });
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.currentPage.set(Math.floor(event.first / event.rows));
    this.pageSize.set(event.rows);
    this.loadDocuments();
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadDocuments();
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      if (this.hasProcessingDocuments()) {
        this.loadDocuments();
      }
    }, 10000); // Poll every 10 seconds
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // ============ UPLOAD ============

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
      const response = await this.documentService.upload(filesToUpload).toPromise();

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
        detail: `${response?.documents.length} documento(s) subido(s)`
      });

      // Clear upload list and reload documents
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

  // ============ DOCUMENT ACTIONS ============

  viewDetails(doc: Document): void {
    this.selectedDocument.set(doc);
    this.showDetailDialog.set(true);
  }

  closeDetailDialog(): void {
    this.showDetailDialog.set(false);
    this.selectedDocument.set(null);
  }

  downloadDocument(doc: Document): void {
    this.documentService.download(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalFilename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo descargar el documento'
        });
      }
    });
  }

  confirmDelete(doc: Document): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${doc.originalFilename}"?`,
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
          detail: `"${doc.originalFilename}" eliminado correctamente`
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

  // ============ HELPERS ============

  getStatusSeverity(status: ProcessingStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PROCESSING': return 'info';
      case 'UPLOADED': return 'warn';
      case 'FAILED': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: ProcessingStatus): string {
    switch (status) {
      case 'COMPLETED': return 'Listo';
      case 'PROCESSING': return 'Procesando';
      case 'UPLOADED': return 'Subido';
      case 'FAILED': return 'Error';
      default: return status;
    }
  }

  getTypeIcon(type: DocumentType): string {
    switch (type) {
      case 'PDF': return 'pi-file-pdf';
      case 'DOC':
      case 'DOCX': return 'pi-file-word';
      case 'TXT':
      case 'MARKDOWN': return 'pi-file';
      case 'CSV': return 'pi-file-excel';
      default: return 'pi-file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  isDocumentReady(doc: Document): boolean {
    return doc.status === 'COMPLETED';
  }
}
