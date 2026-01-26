import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, delay } from 'rxjs';
import {
  Quiz,
  QuizQuestion,
  GenerateQuizRequest,
  QuizAttempt
} from '../models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly QUIZZES_KEY = 'generated_quizzes';
  private readonly ATTEMPTS_KEY = 'quiz_attempts';

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
    if (!this.isBrowser) return;

    const attempts = this.loadAttempts();
    attempts.push(attempt);
    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
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
    if (!this.isBrowser) return [];

    try {
      const data = localStorage.getItem(this.QUIZZES_KEY);
      if (!data) return [];

      return JSON.parse(data).map((quiz: Quiz) => ({
        ...quiz,
        createdAt: new Date(quiz.createdAt)
      }));
    } catch {
      return [];
    }
  }

  private saveQuizzesToStorage(quizzes: Quiz[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(quizzes));
  }

  private loadAttempts(): QuizAttempt[] {
    if (!this.isBrowser) return [];

    try {
      const data = localStorage.getItem(this.ATTEMPTS_KEY);
      if (!data) return [];

      return JSON.parse(data).map((attempt: QuizAttempt) => ({
        ...attempt,
        completedAt: new Date(attempt.completedAt)
      }));
    } catch {
      return [];
    }
  }
}
