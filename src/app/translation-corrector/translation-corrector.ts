import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';
import { EvaluationService, EvaluationResponse } from '../services/evaluation.service';
import { firstValueFrom, Subject } from 'rxjs';

@Component({
  selector: 'app-translation-corrector',
  standalone: true,
  imports: [FormsModule, MarkdownComponent],
  templateUrl: './translation-corrector.html',
  styleUrl: './translation-corrector.scss',
})
export class TranslationCorrector implements OnInit, OnDestroy {
  englishText = signal('');
  tamilTranslation = signal('');
  evaluationResult = signal<EvaluationResponse | null>(null);
  isProcessing = signal(false);
  isCopied = signal(false);
  errorMessage = signal('');
  readonly maxChars = 3000;

  private destroy$ = new Subject<void>();

  constructor(
    private evaluationService: EvaluationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log('Evaluator Component Initialized');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onEvaluate() {
    const english = this.englishText().trim();
    const tamil = this.tamilTranslation().trim();

    if (!english || !tamil) return;

    if (english.length > this.maxChars || tamil.length > this.maxChars) {
      this.errorMessage.set(
        `Input is too long. Please limit both texts to ${this.maxChars} characters for a precise evaluation.`,
      );
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.evaluationResult.set(null);
    this.cdr.detectChanges();

    console.log('--- Evaluation Started (Signals/Async) ---');
    try {
      const response = await firstValueFrom(
        this.evaluationService.evaluate({
          englishText: english,
          tamilTranslation: tamil,
        }),
      );

      if (response) {
        console.log('Successfully captured evaluation response:', response);
        this.evaluationResult.set(response);
      } else {
        console.warn('Evaluation response was empty.');
      }
    } catch (err) {
      console.error('Critical Evaluation Error:', err);
      this.errorMessage.set('Evaluation failed. Please verify your connection or backend status.');
    } finally {
      this.isProcessing.set(false);
      console.log('--- Evaluation Finished (Signals/Async) ---');
      this.cdr.detectChanges();
    }
  }

  onCopyImproved() {
    const improved = this.evaluationResult()?.improvedTranslation;
    if (!improved) return;

    navigator.clipboard.writeText(improved).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    });
  }

  reset() {
    this.englishText.set('');
    this.tamilTranslation.set('');
    this.evaluationResult.set(null);
    this.errorMessage.set('');
  }
}
