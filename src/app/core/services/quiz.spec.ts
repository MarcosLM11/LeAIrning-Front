import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { QuizService } from './quiz';
import { environment } from '../../../environments/environment';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/quizz`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate quiz with params', () => {
    service.generate('doc-1', 5, 'MEDIUM').subscribe();
    const req = httpMock.expectOne(r => r.url === `${apiUrl}/generate/doc-1` && r.method === 'POST');
    expect(req.request.params.get('numberOfQuestions')).toBe('5');
    expect(req.request.params.get('difficulty')).toBe('MEDIUM');
    req.flush({ id: 'q-1', questions: [] });
  });

  it('should list quizzes with pagination', () => {
    service.list(0, 10).subscribe();
    const req = httpMock.expectOne(r => r.url === apiUrl && r.method === 'GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush({ content: [], totalElements: 0 });
  });

  it('should get quiz by id', () => {
    service.get('q-1').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/q-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ questions: [] });
  });

  it('should update quiz score', () => {
    service.updateScore('q-1', 85).subscribe();
    const req = httpMock.expectOne(r => r.url === `${apiUrl}/q-1/score` && r.method === 'PATCH');
    expect(req.request.params.get('score')).toBe('85');
    req.flush(null);
  });
});
