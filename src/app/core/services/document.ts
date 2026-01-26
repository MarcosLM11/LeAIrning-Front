import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Document,
  DocumentPage,
  DocumentStatistics,
  UploadDocumentResponse,
  BatchDeleteRequest,
  BatchDeleteResponse,
  DocumentListParams
} from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080/api/1.0/documents';
  private http = inject(HttpClient);

  upload(files: File[]): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<UploadDocumentResponse>(this.apiUrl, formData);
  }

  list(params?: DocumentListParams): Observable<DocumentPage> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<DocumentPage>(this.apiUrl, { params: httpParams });
  }

  get(documentId: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${documentId}`);
  }

  download(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${documentId}/download`, {
      responseType: 'blob'
    });
  }

  delete(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}`);
  }

  deleteBatch(request: BatchDeleteRequest): Observable<BatchDeleteResponse> {
    return this.http.delete<BatchDeleteResponse>(`${this.apiUrl}/batch`, {
      body: request
    });
  }

  getStatistics(): Observable<DocumentStatistics> {
    return this.http.get<DocumentStatistics>(`${this.apiUrl}/statistics`);
  }
}
