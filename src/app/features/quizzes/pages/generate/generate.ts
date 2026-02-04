import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { DocumentSelector } from '../../../../shared/components/document-selector/document-selector';
import { firstValueFrom } from 'rxjs';
import { QuizService } from '../../../../core/services/quiz';
import { DocumentService } from '../../../../core/services/document';
import { Document } from '../../../../core/models/document.model';
import { Quiz, GenerateQuizRequest, QuestionType, DifficultyLevel } from '../../../../core/models/quiz.model';
import { SelectionManager } from '../../../../shared/utils/selection.utils';
import { ToastService } from '../../../../shared/services/toast.service';

interface DifficultyOption {
  label: string;
  value: DifficultyLevel;
}

interface QuestionTypeOption {
  label: string;
  value: QuestionType;
  icon: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { label: 'Fácil', value: 'EASY' },
  { label: 'Medio', value: 'MEDIUM' },
  { label: 'Difícil', value: 'HARD' }
];

const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
  { label: 'Opción múltiple', value: 'MULTIPLE_CHOICE', icon: 'pi-list' },
  { label: 'Verdadero/Falso', value: 'TRUE_FALSE', icon: 'pi-check-square' },
  { label: 'Respuesta corta', value: 'SHORT_ANSWER', icon: 'pi-pencil' }
];

@Component({
  selector: 'app-generate-quiz',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SliderModule,
    SelectModule,
    CheckboxModule,
    ToastModule,
    DocumentSelector
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

  // Document selection
  readonly documentSelection = new SelectionManager<Document>();

  // Quiz configuration
  documents = signal<Document[]>([]);
  numberOfQuestions = signal(10);
  selectedDifficulty = signal<DifficultyLevel>('MEDIUM');
  selectedTypes = signal<QuestionType[]>(['MULTIPLE_CHOICE']);

  // Loading states
  isLoadingDocs = signal(true);
  isGenerating = signal(false);

  // Quiz state
  generatedQuiz = signal<Quiz | null>(null);
  currentQuestionIndex = signal(0);
  userAnswers = signal<Record<string, string>>({});
  showResults = signal(false);

  // Options
  readonly difficultyOptions = DIFFICULTY_OPTIONS;
  readonly questionTypeOptions = QUESTION_TYPE_OPTIONS;

  // Computed from selection manager
  hasDocuments = computed(() => this.documents().length > 0);
  allSelected = this.documentSelection.allSelected;
  selectedDocumentIds = computed(() => this.documentSelection.getSelectedIds());

  canGenerate = computed(() =>
    this.selectedDocumentIds().length > 0 &&
    this.selectedTypes().length > 0 &&
    !this.isGenerating()
  );

  currentQuestion = computed(() => {
    const quiz = this.generatedQuiz();
    return quiz?.questions[this.currentQuestionIndex()] ?? null;
  });

  isLastQuestion = computed(() => {
    const quiz = this.generatedQuiz();
    return quiz ? this.currentQuestionIndex() >= quiz.questions.length - 1 : false;
  });

  quizScore = computed(() => {
    const quiz = this.generatedQuiz();
    const answers = this.userAnswers();
    if (!quiz) return { correct: 0, total: 0, percentage: 0 };

    const correct = quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length;
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
      const docs = response?.content ?? [];
      this.documents.set(docs);
      this.documentSelection.setItems(docs);
    } catch {
      this.toast.error('No se pudieron cargar los documentos');
    } finally {
      this.isLoadingDocs.set(false);
    }
  }

  toggleSelectAll(): void {
    this.documentSelection.toggleAll();
  }

  toggleDocument(docId: string): void {
    this.documentSelection.toggle(docId);
  }

  toggleQuestionType(type: QuestionType): void {
    this.selectedTypes.update(types => {
      if (types.includes(type)) {
        return types.length > 1 ? types.filter(t => t !== type) : types;
      }
      return [...types, type];
    });
  }

  isTypeSelected(type: QuestionType): boolean {
    return this.selectedTypes().includes(type);
  }

  async generateQuiz(): Promise<void> {
    if (!this.canGenerate()) return;

    this.isGenerating.set(true);
    try {
      const request: GenerateQuizRequest = {
        documentIds: this.selectedDocumentIds(),
        numberOfQuestions: this.numberOfQuestions(),
        questionTypes: this.selectedTypes(),
        difficulty: this.selectedDifficulty()
      };

      const quiz = await firstValueFrom(this.quizService.generate(request));
      if (quiz) {
        this.generatedQuiz.set(quiz);
        this.quizService.saveQuiz(quiz);
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
    this.userAnswers.set({});
    this.showResults.set(false);
  }

  selectAnswer(questionId: string, answer: string): void {
    this.userAnswers.update(answers => ({ ...answers, [questionId]: answer }));
  }

  getSelectedAnswer(questionId: string): string | undefined {
    return this.userAnswers()[questionId];
  }

  nextQuestion(): void {
    const quiz = this.generatedQuiz();
    if (quiz && this.currentQuestionIndex() < quiz.questions.length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
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

  isAnswerCorrect(questionId: string, answer: string): boolean {
    const quiz = this.generatedQuiz();
    if (!quiz || !this.showResults()) return false;
    return quiz.questions.find(q => q.id === questionId)?.correctAnswer === answer;
  }

  isAnswerIncorrect(questionId: string, answer: string): boolean {
    const quiz = this.generatedQuiz();
    const userAnswer = this.userAnswers()[questionId];
    if (!quiz || !this.showResults() || userAnswer !== answer) return false;
    return quiz.questions.find(q => q.id === questionId)?.correctAnswer !== answer;
  }
}
