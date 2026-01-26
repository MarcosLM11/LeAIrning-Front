export type DocumentType = 'PDF' | 'TXT' | 'CSV' | 'DOC' | 'DOCX' | 'MARKDOWN';

export type ProcessingStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Document {
  id: number;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  documentType: DocumentType;
  status: ProcessingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentResponse {
  documents: Document[];
  message: string;
}

export interface DocumentPage {
  content: Document[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface DocumentStatistics {
  totalDocuments: number;
  storageUsed: number;
}

export interface BatchDeleteRequest {
  documentIds: number[];
}

export interface BatchDeleteResponse {
  deleted: number;
  failed: number;
}

export interface DocumentListParams {
  status?: ProcessingStatus;
  type?: DocumentType;
  page?: number;
  size?: number;
  sort?: string;
}
