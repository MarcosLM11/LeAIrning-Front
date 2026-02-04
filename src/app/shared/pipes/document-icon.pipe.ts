import { Pipe, PipeTransform } from '@angular/core';
import { getDocumentIcon, getFileIcon } from '../utils/file.utils';

@Pipe({
  name: 'documentIcon',
  standalone: true,
})
export class DocumentIconPipe implements PipeTransform {
  transform(value: string, type: 'contentType' | 'filename' = 'contentType'): string {
    return type === 'filename' ? getFileIcon(value) : getDocumentIcon(value);
  }
}
