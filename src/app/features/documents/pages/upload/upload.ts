import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DocumentService } from '../../../../core/services/document';
import { Document, ProcessingStatus } from '../../../../core/models/document.model';

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  document?: Document;
  errorMessage?: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown'
];

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'csv', 'doc', 'docx', 'md'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Component({
  selector: 'app-upload',
  imports: [
    CommonModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Upload {
  private documentService = inject(DocumentService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  files = signal<FileUpload[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);

  hasFiles = computed(() => this.files().length > 0);
  canUpload = computed(() => {
    const fileList = this.files();
    return fileList.length > 0 && fileList.some(f => f.status === 'pending');
  });
  uploadProgress = computed(() => {
    const fileList = this.files();
    if (fileList.length === 0) return 0;
    const total = fileList.reduce((sum, f) => sum + f.progress, 0);
    return Math.round(total / fileList.length);
  });

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
      this.files.update(current => [...current, ...validFiles]);
    }
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Usa: ${ALLOWED_EXTENSIONS.join(', ')}`
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'El archivo excede el tamaño máximo de 50MB'
      };
    }

    return { valid: true };
  }

  removeFile(index: number): void {
    this.files.update(current => current.filter((_, i) => i !== index));
  }

  clearAll(): void {
    this.files.set([]);
  }

  async uploadFiles(): Promise<void> {
    const pendingFiles = this.files().filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    this.isUploading.set(true);

    // Mark all pending as uploading
    this.files.update(current =>
      current.map(f => f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 10 } : f)
    );

    try {
      const filesToUpload = pendingFiles.map(f => f.file);

      // Simular progreso mientras se sube
      const progressInterval = setInterval(() => {
        this.files.update(current =>
          current.map(f => {
            if (f.status === 'uploading' && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          })
        );
      }, 200);

      const response = await this.documentService.upload(filesToUpload).toPromise();

      clearInterval(progressInterval);

      // Map response documents to uploaded files
      this.files.update(current =>
        current.map(f => {
          if (f.status === 'uploading') {
            const uploadedDoc = response?.documents.find(
              d => d.originalFilename === f.file.name
            );
            if (uploadedDoc) {
              return {
                ...f,
                status: 'success' as const,
                progress: 100,
                document: uploadedDoc
              };
            }
            return { ...f, status: 'success' as const, progress: 100 };
          }
          return f;
        })
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Subida completada',
        detail: `${response?.documents.length} documento(s) subido(s) correctamente`
      });

    } catch (error) {
      this.files.update(current =>
        current.map(f => {
          if (f.status === 'uploading') {
            return {
              ...f,
              status: 'error' as const,
              progress: 0,
              errorMessage: 'Error al subir el archivo'
            };
          }
          return f;
        })
      );

      this.messageService.add({
        severity: 'error',
        summary: 'Error de subida',
        detail: 'No se pudieron subir los archivos. Inténtalo de nuevo.'
      });
    } finally {
      this.isUploading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getFileIcon(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pi-file-pdf';
      case 'doc':
      case 'docx': return 'pi-file-word';
      case 'txt':
      case 'md': return 'pi-file';
      case 'csv': return 'pi-file-excel';
      default: return 'pi-file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusIcon(status: FileUpload['status']): string {
    switch (status) {
      case 'pending': return 'pi-clock';
      case 'uploading': return 'pi-spin pi-spinner';
      case 'success': return 'pi-check-circle';
      case 'error': return 'pi-times-circle';
    }
  }

  getStatusClass(status: FileUpload['status']): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'uploading': return 'status-uploading';
      case 'success': return 'status-success';
      case 'error': return 'status-error';
    }
  }

  getProcessingStatusText(status?: ProcessingStatus): string {
    if (!status) return '';
    switch (status) {
      case 'UPLOADED': return 'Subido';
      case 'PROCESSING': return 'Procesando...';
      case 'COMPLETED': return 'Listo';
      case 'FAILED': return 'Error';
    }
  }
}
