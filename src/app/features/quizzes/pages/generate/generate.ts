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
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { QuizService } from '../../../../core/services/quiz';
import { DocumentService } from '../../../../core/services/document';
import { Document } from '../../../../core/models/document.model';
import {
  Quiz,
  QuizQuestion,
  GenerateQuizRequest,
  QuestionType,
  DifficultyLevel
} from '../../../../core/models/quiz.model';

interface DifficultyOption {
  label: string;
  value: DifficultyLevel;
}

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
    SkeletonModule
  ],
  providers: [MessageService],
  templateUrl: './generate.html',
  styleUrl: './generate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Generate implements OnInit {
  private quizService = inject(QuizService);
  private documentService = inject(DocumentService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // State
  documents = signal<Document[]>([]);
  selectedDocumentIds = signal<number[]>([]);
  numberOfQuestions = signal(10);
  selectedDifficulty = signal<DifficultyLevel>('MEDIUM');
  selectedTypes = signal<QuestionType[]>(['MULTIPLE_CHOICE']);
  isLoadingDocs = signal(true);
  isGenerating = signal(false);
  generatedQuiz = signal<Quiz | null>(null);
  currentQuestionIndex = signal(0);
  userAnswers = signal<Record<string, string>>({});
  showResults = signal(false);

  // Options
  difficultyOptions: DifficultyOption[] = [
    { label: 'Fácil', value: 'EASY' },
    { label: 'Medio', value: 'MEDIUM' },
    { label: 'Difícil', value: 'HARD' }
  ];

  questionTypeOptions = [
    { label: 'Opción múltiple', value: 'MULTIPLE_CHOICE' as QuestionType, icon: 'pi-list' },
    { label: 'Verdadero/Falso', value: 'TRUE_FALSE' as QuestionType, icon: 'pi-check-square' },
    { label: 'Respuesta corta', value: 'SHORT_ANSWER' as QuestionType, icon: 'pi-pencil' }
  ];

  // Computed
  completedDocuments = computed(() =>
    this.documents().filter(d => d.status === 'COMPLETED')
  );
  hasDocuments = computed(() => this.completedDocuments().length > 0);
  canGenerate = computed(() =>
    this.selectedDocumentIds().length > 0 &&
    this.selectedTypes().length > 0 &&
    !this.isGenerating()
  );
  allSelected = computed(() => {
    const completed = this.completedDocuments();
    const selected = this.selectedDocumentIds();
    return completed.length > 0 && completed.every(d => selected.includes(d.id));
  });
  currentQuestion = computed(() => {
    const quiz = this.generatedQuiz();
    if (!quiz) return null;
    return quiz.questions[this.currentQuestionIndex()];
  });
  isLastQuestion = computed(() => {
    const quiz = this.generatedQuiz();
    if (!quiz) return false;
    return this.currentQuestionIndex() >= quiz.questions.length - 1;
  });
  quizScore = computed(() => {
    const quiz = this.generatedQuiz();
    const answers = this.userAnswers();
    if (!quiz) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    for (const question of quiz.questions) {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    }

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
      const response = await this.documentService.list({ status: 'COMPLETED', size: 100 }).toPromise();
      this.documents.set(response?.content ?? []);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los documentos'
      });
    } finally {
      this.isLoadingDocs.set(false);
    }
  }

  toggleSelectAll(): void {
    const completed = this.completedDocuments();
    if (this.allSelected()) {
      this.selectedDocumentIds.set([]);
    } else {
      this.selectedDocumentIds.set(completed.map(d => d.id));
    }
  }

  toggleDocument(docId: number): void {
    this.selectedDocumentIds.update(ids => {
      if (ids.includes(docId)) {
        return ids.filter(id => id !== docId);
      }
      return [...ids, docId];
    });
  }

  isDocumentSelected(docId: number): boolean {
    return this.selectedDocumentIds().includes(docId);
  }

  toggleQuestionType(type: QuestionType): void {
    this.selectedTypes.update(types => {
      if (types.includes(type)) {
        // Don't allow empty selection
        if (types.length === 1) return types;
        return types.filter(t => t !== type);
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

      const quiz = await this.quizService.generate(request).toPromise();

      if (quiz) {
        this.generatedQuiz.set(quiz);
        this.quizService.saveQuiz(quiz);
        this.currentQuestionIndex.set(0);
        this.userAnswers.set({});
        this.showResults.set(false);

        this.messageService.add({
          severity: 'success',
          summary: 'Quiz generado',
          detail: `Se han generado ${quiz.questions.length} preguntas`
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo generar el quiz. Inténtalo de nuevo.'
      });
    } finally {
      this.isGenerating.set(false);
    }
  }

  selectAnswer(questionId: string, answer: string): void {
    this.userAnswers.update(answers => ({
      ...answers,
      [questionId]: answer
    }));
  }

  getSelectedAnswer(questionId: string): string | undefined {
    return this.userAnswers()[questionId];
  }

  nextQuestion(): void {
    const quiz = this.generatedQuiz();
    if (!quiz) return;

    if (this.currentQuestionIndex() < quiz.questions.length - 1) {
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
    this.currentQuestionIndex.set(0);
    this.userAnswers.set({});
    this.showResults.set(false);
  }

  generateNewQuiz(): void {
    this.generatedQuiz.set(null);
    this.showResults.set(false);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getDocumentIcon(doc: Document): string {
    switch (doc.documentType) {
      case 'PDF': return 'pi-file-pdf';
      case 'DOC':
      case 'DOCX': return 'pi-file-word';
      case 'CSV': return 'pi-file-excel';
      default: return 'pi-file';
    }
  }

  isAnswerCorrect(questionId: string, answer: string): boolean {
    const quiz = this.generatedQuiz();
    if (!quiz || !this.showResults()) return false;

    const question = quiz.questions.find(q => q.id === questionId);
    return question?.correctAnswer === answer;
  }

  isAnswerIncorrect(questionId: string, answer: string): boolean {
    const quiz = this.generatedQuiz();
    const userAnswer = this.userAnswers()[questionId];
    if (!quiz || !this.showResults() || userAnswer !== answer) return false;

    const question = quiz.questions.find(q => q.id === questionId);
    return question?.correctAnswer !== answer;
  }
}
