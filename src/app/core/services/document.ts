import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document, DocumentPage, DocumentListParams } from '../models/document.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly apiUrl = `${environment.apiUrl}/documents`;
  private http = inject(HttpClient);

  upload(files: File[]): Observable<void> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<void>(this.apiUrl, formData);
  }

  list(params?: DocumentListParams): Observable<DocumentPage> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<DocumentPage>(this.apiUrl, { params: httpParams });
  }

  get(documentId: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${documentId}`);
  }

  delete(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}`);
  }
}