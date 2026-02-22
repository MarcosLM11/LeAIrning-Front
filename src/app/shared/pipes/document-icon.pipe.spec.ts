import { DocumentIconPipe } from './document-icon.pipe';

describe('DocumentIconPipe', () => {
  let pipe: DocumentIconPipe;

  beforeEach(() => {
    pipe = new DocumentIconPipe();
  });

  it('should return content type icon by default', () => {
    expect(pipe.transform('application/pdf')).toBe('pi-file-pdf');
  });

  it('should return content type icon when type is contentType', () => {
    expect(pipe.transform('application/msword', 'contentType')).toBe('pi-file-word');
  });

  it('should return file icon when type is filename', () => {
    expect(pipe.transform('report.pdf', 'filename')).toBe('pi-file-pdf');
  });

  it('should return generic icon for unknown content type', () => {
    expect(pipe.transform('text/plain', 'contentType')).toBe('pi-file');
  });

  it('should return generic icon for unknown file extension', () => {
    expect(pipe.transform('notes.txt', 'filename')).toBe('pi-file');
  });
});
