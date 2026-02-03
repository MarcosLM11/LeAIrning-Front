export interface Document {
  id: string;
  userId: string;
  fileName: string;
  contentType: string;
  size: number;
  storagePath: string;
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

export interface DocumentListParams {
  page?: number;
  size?: number;
  sort?: string;
}