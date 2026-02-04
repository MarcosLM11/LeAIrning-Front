import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { Document } from '../../../core/models/document.model';
import { getDocumentIcon } from '../../utils/file.utils';

@Component({
  selector: 'app-document-selector',
  standalone: true,
  imports: [CommonModule, RouterLink, Skeleton],
  templateUrl: './document-selector.html',
  styleUrl: './document-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentSelector {
  // Inputs
  documents = input.required<Document[]>();
  selectedIds = input.required<string[]>();
  isLoading = input(false);
  showSelectAll = input(true);
  selectAllLabel = input('Seleccionar todos');
  emptyMessage = input('No tienes documentos procesados');
  uploadLinkText = input('Subir documentos');
  uploadRoute = input('/documents/upload');
  skeletonCount = input(3);

  // Outputs
  selectionChange = output<string[]>();
  toggleAll = output<void>();
  toggleDocument = output<string>();

  // Computed
  hasDocuments = computed(() => this.documents().length > 0);
  allSelected = computed(() => {
    const docs = this.documents();
    const selected = this.selectedIds();
    return docs.length > 0 && selected.length === docs.length;
  });

  // Re-export util for template
  getDocumentIcon = getDocumentIcon;

  isSelected(docId: string): boolean {
    return this.selectedIds().includes(docId);
  }

  onToggleAll(): void {
    this.toggleAll.emit();
  }

  onToggleDocument(docId: string): void {
    this.toggleDocument.emit(docId);
  }
}
