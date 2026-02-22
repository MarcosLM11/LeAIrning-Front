import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Generate } from './generate';
import { QuizService } from '../../../../core/services/quiz';
import { DocumentService } from '../../../../core/services/document';
import { ToastService } from '../../../../shared/services/toast.service';

describe('Generate', () => {
  let mockQuizService: {
    generate: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    updateScore: ReturnType<typeof vi.fn>;
  };
  let mockDocumentService: { list: ReturnType<typeof vi.fn> };
  let mockToast: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockQuizService = {
      generate: vi.fn(),
      get: vi.fn(),
      list: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
      updateScore: vi.fn().mockReturnValue(of(null)),
    };
    mockDocumentService = {
      list: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
    };
    mockToast = { success: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: QuizService, useValue: mockQuizService },
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: ToastService, useValue: mockToast },
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
      ],
    });
  });

  function create() {
    const fixture = TestBed.createComponent(Generate);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(create().componentInstance).toBeTruthy();
  });

  it('should load documents and quiz history on init', () => {
    create();
    expect(mockDocumentService.list).toHaveBeenCalled();
    expect(mockQuizService.list).toHaveBeenCalled();
  });

  it('should default to MEDIUM difficulty', () => {
    expect(create().componentInstance.selectedDifficulty()).toBe('MEDIUM');
  });

  it('should not generate when no document selected', () => {
    expect(create().componentInstance.canGenerate()).toBe(false);
  });

  it('should allow generation when document selected', () => {
    const comp = create().componentInstance;
    comp.selectedDocumentId.set('doc-1');
    expect(comp.canGenerate()).toBe(true);
  });

  it('should select document', () => {
    const comp = create().componentInstance;
    comp.selectDocument('doc-1');
    expect(comp.selectedDocumentId()).toBe('doc-1');
  });

  it('should reveal answer', () => {
    const comp = create().componentInstance;
    expect(comp.answerRevealed()).toBe(false);
    comp.revealAnswer();
    expect(comp.answerRevealed()).toBe(true);
  });

  it('should navigate questions', () => {
    const comp = create().componentInstance;
    comp.generatedQuiz.set({ questions: [{ question: 'q1', answer: 'a1', type: 'EASY' }, { question: 'q2', answer: 'a2', type: 'EASY' }] });
    comp.nextQuestion();
    expect(comp.currentQuestionIndex()).toBe(1);
    comp.previousQuestion();
    expect(comp.currentQuestionIndex()).toBe(0);
  });

  it('should compute quiz score', () => {
    const comp = create().componentInstance;
    comp.generatedQuiz.set({ questions: [{ question: 'q', answer: 'a', type: 'EASY' }, { question: 'q2', answer: 'a2', type: 'EASY' }] });
    comp.selfAssessments.set({ 0: true, 1: false });
    expect(comp.quizScore()).toEqual({ correct: 1, total: 2, percentage: 50 });
  });

  it('should reset quiz state on retry', () => {
    const comp = create().componentInstance;
    comp.currentQuestionIndex.set(5);
    comp.selfAssessments.set({ 0: true });
    comp.showResults.set(true);
    comp.retryQuiz();
    expect(comp.currentQuestionIndex()).toBe(0);
    expect(comp.selfAssessments()).toEqual({});
    expect(comp.showResults()).toBe(false);
  });

  it('should generate new quiz by clearing state', () => {
    const comp = create().componentInstance;
    comp.generatedQuiz.set({ questions: [] });
    comp.activeQuizId.set('q1');
    comp.generateNewQuiz();
    expect(comp.generatedQuiz()).toBeNull();
    expect(comp.activeQuizId()).toBeNull();
  });
});
