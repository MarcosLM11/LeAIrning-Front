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
import { firstValueFrom } from 'rxjs';
import { DocumentService } from '../../../../core/services/document';
import { validateFile, formatFileSize, getFileIcon } from '../../../../shared/utils/file.utils';
import {
  FileUpload,
  UploadStatus,
  UPLOAD_STATUS_ICONS,
  UPLOAD_STATUS_CLASSES
} from '../../../../shared/models/file-upload.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-upload',
  imports: [CommonModule, ButtonModule, ProgressBarModule, ToastModule],
  templateUrl: './upload.html',
  styleUrl: './upload.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Upload {
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);
  private router = inject(Router);

  files = signal<FileUpload[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);

  hasFiles = computed(() => this.files().length > 0);
  canUpload = computed(() => this.files().some(f => f.status === 'pending'));
  uploadProgress = computed(() => {
    const fileList = this.files();
    if (fileList.length === 0) return 0;
    return Math.round(fileList.reduce((sum, f) => sum + f.progress, 0) / fileList.length);
  });

  // Re-export utils for template
  formatFileSize = formatFileSize;
  getFileIcon = (file: File) => getFileIcon(file.name);
  getStatusIcon = (status: UploadStatus) => UPLOAD_STATUS_ICONS[status];
  getStatusClass = (status: UploadStatus) => UPLOAD_STATUS_CLASSES[status];

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

  private addFiles(newFiles: File[]): void {
    for (const file of newFiles) {
      const validation = validateFile(file);
      if (validation.valid) {
        this.files.update(current => [...current, { file, progress: 0, status: 'pending' }]);
      } else {
        this.toast.error(`${file.name}: ${validation.error}`, 'Archivo no válido');
      }
    }
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
    this.updateFilesStatus('pending', 'uploading', 10);

    const progressInterval = setInterval(() => {
      this.files.update(current =>
        current.map(f => f.status === 'uploading' && f.progress < 90
          ? { ...f, progress: f.progress + 10 }
          : f
        )
      );
    }, 200);

    try {
      await firstValueFrom(this.documentService.upload(pendingFiles.map(f => f.file)));
      clearInterval(progressInterval);
      this.updateFilesStatus('uploading', 'success', 100);
      this.toast.success(`${pendingFiles.length} documento(s) subido(s) correctamente`, 'Subida completada');
    } catch {
      clearInterval(progressInterval);
      this.files.update(current =>
        current.map(f => f.status === 'uploading'
          ? { ...f, status: 'error' as const, progress: 0, errorMessage: 'Error al subir el archivo' }
          : f
        )
      );
      this.toast.error('No se pudieron subir los archivos. Inténtalo de nuevo.', 'Error de subida');
    } finally {
      this.isUploading.set(false);
    }
  }

  private updateFilesStatus(from: UploadStatus, to: UploadStatus, progress: number): void {
    this.files.update(current =>
      current.map(f => f.status === from ? { ...f, status: to, progress } : f)
    );
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
