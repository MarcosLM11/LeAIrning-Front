/**
 * File utilities for validation, formatting, and icon mapping.
 * Centralizes file-related logic used across the application.
 */

export type AllowedExtension = 'pdf' | 'txt' | 'csv' | 'doc' | 'docx' | 'md';

export const FILE_CONFIG = {
  ALLOWED_EXTENSIONS: ['pdf', 'txt', 'csv', 'doc', 'docx', 'md'] as AllowedExtension[],
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  MAX_FILE_SIZE_LABEL: '50MB',
} as const;

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));

  return `${size} ${FILE_SIZE_UNITS[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export function validateFile(file: File): FileValidationResult {
  const extension = getFileExtension(file.name);

  if (!extension || !FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension as AllowedExtension)) {
    return {
      valid: false,
      error: `Tipo no permitido. Usa: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Excede ${FILE_CONFIG.MAX_FILE_SIZE_LABEL}`,
    };
  }

  return { valid: true };
}

export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);

  switch (ext) {
    case 'pdf':
      return 'pi-file-pdf';
    case 'doc':
    case 'docx':
      return 'pi-file-word';
    case 'csv':
    case 'xls':
    case 'xlsx':
      return 'pi-file-excel';
    default:
      return 'pi-file';
  }
}

export function getDocumentIcon(contentType: string): string {
  if (contentType.includes('pdf')) return 'pi-file-pdf';
  if (contentType.includes('word') || contentType.includes('document')) return 'pi-file-word';
  if (contentType.includes('csv') || contentType.includes('excel') || contentType.includes('spreadsheet')) return 'pi-file-excel';
  return 'pi-file';
}

export function isAllowedExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension as AllowedExtension);
}
