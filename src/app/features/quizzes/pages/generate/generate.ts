import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom } from 'rxjs';
import { QuizService } from '../../../../core/services/quiz';
import { DocumentService } from '../../../../core/services/document';
import { Document } from '../../../../core/models/document.model';
import { Quiz, DifficultyLevel } from '../../../../core/models/quiz.model';
import { ToastService } from '../../../../shared/services/toast.service';

interface DifficultyOption {
  label: string;
  value: DifficultyLevel;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { label: 'Fácil', value: 'EASY' },
  { label: 'Medio', value: 'MEDIUM' },
  { label: 'Difícil', value: 'HARD' }
];

@Component({
  selector: 'app-generate-quiz',
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './generate.html',
  styleUrl: './generate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Generate implements OnInit {
  private quizService = inject(QuizService);
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Document selection (single)
  documents = signal<Document[]>([]);
  selectedDocumentId = signal<string | null>(null);

  // Quiz configuration
  numberOfQuestions = signal(10);
  selectedDifficulty = signal<DifficultyLevel>('MEDIUM');

  // Loading states
  isLoadingDocs = signal(true);
  isGenerating = signal(false);

  // Quiz state
  generatedQuiz = signal<Quiz | null>(null);
  currentQuestionIndex = signal(0);
  answerRevealed = signal(false);
  selfAssessments = signal<Record<number, boolean>>({});
  showResults = signal(false);

  // Options
  readonly difficultyOptions = DIFFICULTY_OPTIONS;

  hasDocuments = computed(() => this.documents().length > 0);

  canGenerate = computed(() =>
    this.selectedDocumentId() !== null && !this.isGenerating()
  );

  currentQuestion = computed(() => {
    const quiz = this.generatedQuiz();
    return quiz?.questions[this.currentQuestionIndex()] ?? null;
  });

  isLastQuestion = computed(() => {
    const quiz = this.generatedQuiz();
    return quiz ? this.currentQuestionIndex() >= quiz.questions.length - 1 : false;
  });

  isCurrentAssessed = computed(() => {
    return this.selfAssessments()[this.currentQuestionIndex()] !== undefined;
  });

  quizScore = computed(() => {
    const quiz = this.generatedQuiz();
    const assessments = this.selfAssessments();
    if (!quiz) return { correct: 0, total: 0, percentage: 0 };
    const correct = Object.values(assessments).filter(v => v).length;
    return {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100)
    };
  });

  ngOnInit(): void {
    this.loadDocuments();
  }

  private async loadDocuments(): Promise<void> {
    this.isLoadingDocs.set(true);
    try {
      const response = await firstValueFrom(this.documentService.list({ size: 100 }));
      this.documents.set(response?.content ?? []);
      const docIdParam = this.route.snapshot.queryParamMap.get('documentId');
      if (docIdParam) {
        this.selectedDocumentId.set(docIdParam);
      }
    } catch {
      this.toast.error('No se pudieron cargar los documentos');
    } finally {
      this.isLoadingDocs.set(false);
    }
  }

  selectDocument(docId: string): void {
    this.selectedDocumentId.set(docId);
  }

  async generateQuiz(): Promise<void> {
    const docId = this.selectedDocumentId();
    if (!docId || this.isGenerating()) return;
    this.isGenerating.set(true);
    try {
      const quiz = await firstValueFrom(
        this.quizService.generate(docId, this.numberOfQuestions(), this.selectedDifficulty())
      );
      if (quiz) {
        this.generatedQuiz.set(quiz);
        this.resetQuizState();
        this.toast.success(`Se han generado ${quiz.questions.length} preguntas`, 'Quiz generado');
      }
    } catch {
      this.toast.error('No se pudo generar el quiz. Inténtalo de nuevo.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  private resetQuizState(): void {
    this.currentQuestionIndex.set(0);
    this.answerRevealed.set(false);
    this.selfAssessments.set({});
    this.showResults.set(false);
  }

  revealAnswer(): void {
    this.answerRevealed.set(true);
  }

  markCorrect(): void {
    this.assess(true);
  }

  markIncorrect(): void {
    this.assess(false);
  }

  private assess(correct: boolean): void {
    const index = this.currentQuestionIndex();
    this.selfAssessments.update(a => ({ ...a, [index]: correct }));
    this.answerRevealed.set(false);
    if (!this.isLastQuestion()) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.showResults.set(true);
    }
  }

  nextQuestion(): void {
    const quiz = this.generatedQuiz();
    if (quiz && this.currentQuestionIndex() < quiz.questions.length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
      this.answerRevealed.set(false);
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
      this.answerRevealed.set(false);
    }
  }

  finishQuiz(): void {
    this.showResults.set(true);
  }

  retryQuiz(): void {
    this.resetQuizState();
  }

  generateNewQuiz(): void {
    this.generatedQuiz.set(null);
    this.showResults.set(false);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}