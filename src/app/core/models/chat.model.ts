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

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}