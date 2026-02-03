export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  documentIds: string[];
  difficulty: DifficultyLevel;
  createdAt: Date;
}

export interface GenerateQuizRequest {
  documentIds: string[];
  numberOfQuestions: number;
  questionTypes: QuestionType[];
  difficulty: DifficultyLevel;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}
