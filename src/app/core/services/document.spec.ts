import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService } from './document';
import { environment } from '../../../environments/environment';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/documents`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload files via POST with FormData', () => {
    const file = new File(['content'], 'test.pdf');
    service.upload([file]).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(null);
  });

  it('should list documents with params', () => {
    service.list({ page: 0, size: 10, sort: 'name,asc' }).subscribe();
    const req = httpMock.expectOne(r => r.url === apiUrl && r.method === 'GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('sort')).toBe('name,asc');
    req.flush({ content: [], totalElements: 0 });
  });

  it('should list documents without params', () => {
    service.list().subscribe();
    const req = httpMock.expectOne(r => r.url === apiUrl && r.method === 'GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ content: [], totalElements: 0 });
  });

  it('should get document by id', () => {
    service.get('doc-1').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/doc-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'doc-1', fileName: 'test.pdf' });
  });

  it('should delete document by id', () => {
    service.delete('doc-1').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/doc-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should download document as blob', () => {
    service.download('doc-1').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/doc-1/download`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['data']));
  });
});
