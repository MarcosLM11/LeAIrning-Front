import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Quiz,
  QuizQuestion,
  GenerateQuizRequest,
  QuizAttempt
} from '../models/quiz.model';
import { StorageService } from '../../shared/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly QUIZZES_KEY = 'generated_quizzes';
  private readonly ATTEMPTS_KEY = 'quiz_attempts';

  private storage = inject(StorageService);

  private quizzesSignal = signal<Quiz[]>(this.loadQuizzes());
  quizzes = this.quizzesSignal.asReadonly();

  /**
   * Genera un quiz basado en documentos.
   * NOTA: Esta es una implementación mock hasta que el backend esté disponible.
   */
  generate(request: GenerateQuizRequest): Observable<Quiz> {
    // Mock implementation - simula generación de quiz
    const mockQuiz: Quiz = {
      id: crypto.randomUUID(),
      title: `Quiz generado - ${new Date().toLocaleDateString()}`,
      description: 'Quiz generado automáticamente a partir de tus documentos',
      questions: this.generateMockQuestions(request),
      documentIds: request.documentIds,
      difficulty: request.difficulty,
      createdAt: new Date()
    };

    // Simular delay de API
    return of(mockQuiz).pipe(
      delay(1500)
    );
  }

  saveQuiz(quiz: Quiz): void {
    this.quizzesSignal.update(quizzes => {
      const updated = [quiz, ...quizzes];
      this.saveQuizzesToStorage(updated);
      return updated;
    });
  }

  getQuiz(quizId: string): Quiz | undefined {
    return this.quizzesSignal().find(q => q.id === quizId);
  }

  deleteQuiz(quizId: string): void {
    this.quizzesSignal.update(quizzes => {
      const updated = quizzes.filter(q => q.id !== quizId);
      this.saveQuizzesToStorage(updated);
      return updated;
    });
  }

  saveAttempt(attempt: QuizAttempt): void {
    const attempts = this.loadAttempts();
    attempts.push(attempt);
    this.storage.set(this.ATTEMPTS_KEY, attempts);
  }

  getAttempts(quizId: string): QuizAttempt[] {
    return this.loadAttempts().filter(a => a.quizId === quizId);
  }

  private generateMockQuestions(request: GenerateQuizRequest): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const types = request.questionTypes;

    for (let i = 0; i < request.numberOfQuestions; i++) {
      const type = types[i % types.length];

      if (type === 'MULTIPLE_CHOICE') {
        questions.push({
          id: crypto.randomUUID(),
          question: `Pregunta de ejemplo ${i + 1}: ¿Cuál es la respuesta correcta?`,
          type: 'MULTIPLE_CHOICE',
          options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          correctAnswer: 'Opción A',
          explanation: 'Esta es la explicación de por qué la respuesta es correcta.'
        });
      } else if (type === 'TRUE_FALSE') {
        questions.push({
          id: crypto.randomUUID(),
          question: `Pregunta de ejemplo ${i + 1}: Esta afirmación es verdadera.`,
          type: 'TRUE_FALSE',
          options: ['Verdadero', 'Falso'],
          correctAnswer: 'Verdadero',
          explanation: 'Esta es la explicación.'
        });
      } else {
        questions.push({
          id: crypto.randomUUID(),
          question: `Pregunta de ejemplo ${i + 1}: Describe brevemente el concepto.`,
          type: 'SHORT_ANSWER',
          correctAnswer: 'Respuesta de ejemplo',
          explanation: 'Esta es la explicación de la respuesta esperada.'
        });
      }
    }

    return questions;
  }

  private loadQuizzes(): Quiz[] {
    const data = this.storage.get<Quiz[]>(this.QUIZZES_KEY);
    if (!data) return [];

    return data.map(quiz => ({
      ...quiz,
      createdAt: new Date(quiz.createdAt)
    }));
  }

  private saveQuizzesToStorage(quizzes: Quiz[]): void {
    this.storage.set(this.QUIZZES_KEY, quizzes);
  }

  private loadAttempts(): QuizAttempt[] {
    const data = this.storage.get<QuizAttempt[]>(this.ATTEMPTS_KEY);
    if (!data) return [];

    return data.map(attempt => ({
      ...attempt,
      completedAt: new Date(attempt.completedAt)
    }));
  }
}
