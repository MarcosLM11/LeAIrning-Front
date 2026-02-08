export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuizQuestion {
  question: string;
  answer: string;
  type: DifficultyLevel;
}

export interface Quiz {
  questions: QuizQuestion[];
}