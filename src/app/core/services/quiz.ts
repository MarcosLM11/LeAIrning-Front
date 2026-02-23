import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, GeneratedQuiz, QuizzPage, DifficultyLevel } from '../models/quiz.model';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly apiUrl = `${environment.apiUrl}/quizz`;
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  generate(documentId: string, numberOfQuestions: number, difficulty: DifficultyLevel): Observable<GeneratedQuiz> {
    const language = this.translate.currentLang || this.translate.defaultLang || 'es';
    const params = new HttpParams()
      .set('numberOfQuestions', numberOfQuestions)
      .set('difficulty', difficulty)
      .set('language', language);
    return this.http.post<GeneratedQuiz>(`${this.apiUrl}/generate/${documentId}`, null, { params });
  }

  list(page = 0, size = 20): Observable<QuizzPage> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<QuizzPage>(this.apiUrl, { params });
  }

  get(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${quizId}`);
  }

  updateScore(quizId: string, score: number): Observable<void> {
    const params = new HttpParams().set('score', score);
    return this.http.patch<void>(`${this.apiUrl}/${quizId}/score`, null, { params });
  }
}