import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, DifficultyLevel } from '../models/quiz.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly apiUrl = `${environment.apiUrl}/quizz`;
  private http = inject(HttpClient);

  generate(documentId: string, numberOfQuestions: number, difficulty: DifficultyLevel): Observable<Quiz> {
    const params = new HttpParams()
      .set('numberOfQuestions', numberOfQuestions)
      .set('difficulty', difficulty);
    return this.http.post<Quiz>(`${this.apiUrl}/generate/${documentId}`, null, { params });
  }
}