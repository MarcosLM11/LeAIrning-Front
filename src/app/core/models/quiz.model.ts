export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuizQuestion {
  question: string;
  answer: string;
  type: DifficultyLevel;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface GeneratedQuiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuizzSummary {
  id: string;
  documentId: string;
  lastScore: number;
  createdTimestamp: string;
}

export interface QuizzPage {
  content: QuizzSummary[];
  totalElements: number;
  totalPages: number;
}