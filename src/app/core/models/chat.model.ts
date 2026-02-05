export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  conversationId: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Request DTOs for backend API
export interface ConversationCreateRequest {
  title: string;
  documentIds: string[];
}

export interface ConversationUpdateRequest {
  title: string;
}

// Response DTO from backend API
export interface ConversationResponse {
  id: string;
  title: string;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Client-side model with messages (stored in memory)
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Paginated response from backend
export interface ConversationPage {
  content: ConversationResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}
