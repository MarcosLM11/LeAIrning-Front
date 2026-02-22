import {
  formatFileSize,
  getFileExtension,
  validateFile,
  getFileIcon,
  getDocumentIcon,
  isAllowedExtension,
  FILE_CONFIG,
} from './file.utils';

describe('file.utils', () => {
  describe('formatFileSize', () => {
    it('should return 0 B for zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should round to one decimal', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('getFileExtension', () => {
    it('should return extension in lowercase', () => {
      expect(getFileExtension('file.PDF')).toBe('pdf');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('my.file.txt')).toBe('txt');
    });

    it('should return empty string for no extension', () => {
      expect(getFileExtension('noext')).toBe('noext');
    });
  });

  describe('validateFile', () => {
    it('should accept valid pdf file', () => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      expect(validateFile(file)).toEqual({ valid: true });
    });

    it('should reject unsupported extension', () => {
      const file = new File(['content'], 'image.png', { type: 'image/png' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Tipo no permitido');
    });

    it('should reject oversized file', () => {
      const bigContent = new Uint8Array(FILE_CONFIG.MAX_FILE_SIZE + 1);
      const file = new File([bigContent], 'big.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(FILE_CONFIG.MAX_FILE_SIZE_LABEL);
    });

    it('should accept all allowed extensions', () => {
      for (const ext of FILE_CONFIG.ALLOWED_EXTENSIONS) {
        const file = new File(['x'], `test.${ext}`);
        expect(validateFile(file).valid).toBe(true);
      }
    });
  });

  describe('getFileIcon', () => {
    it('should return pdf icon for pdf', () => {
      expect(getFileIcon('report.pdf')).toBe('pi-file-pdf');
    });

    it('should return word icon for doc', () => {
      expect(getFileIcon('report.doc')).toBe('pi-file-word');
    });

    it('should return word icon for docx', () => {
      expect(getFileIcon('report.docx')).toBe('pi-file-word');
    });

    it('should return excel icon for csv', () => {
      expect(getFileIcon('data.csv')).toBe('pi-file-excel');
    });

    it('should return generic icon for unknown', () => {
      expect(getFileIcon('notes.txt')).toBe('pi-file');
    });
  });

  describe('getDocumentIcon', () => {
    it('should return pdf icon for pdf content type', () => {
      expect(getDocumentIcon('application/pdf')).toBe('pi-file-pdf');
    });

    it('should return word icon for word content type', () => {
      expect(getDocumentIcon('application/msword')).toBe('pi-file-word');
    });

    it('should return word icon for document content type', () => {
      expect(getDocumentIcon('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('pi-file-word');
    });

    it('should return excel icon for csv content type', () => {
      expect(getDocumentIcon('text/csv')).toBe('pi-file-excel');
    });

    it('should return generic icon for unknown content type', () => {
      expect(getDocumentIcon('text/plain')).toBe('pi-file');
    });
  });

  describe('isAllowedExtension', () => {
    it('should return true for allowed extensions', () => {
      expect(isAllowedExtension('file.pdf')).toBe(true);
      expect(isAllowedExtension('file.md')).toBe(true);
    });

    it('should return false for disallowed extensions', () => {
      expect(isAllowedExtension('file.png')).toBe(false);
      expect(isAllowedExtension('file.exe')).toBe(false);
    });
  });
});
