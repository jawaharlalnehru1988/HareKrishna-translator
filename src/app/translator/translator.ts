import { Component, ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TranslationService, Translation } from '../services/translation.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-translator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './translator.html',
  styleUrl: './translator.scss',
})
export class Translator {
  sourceText: string = '';
  currentTranslation: Translation | null = null;
  correctedText: string = '';
  sourceLanguage: string = 'English';
  targetLanguage: string = 'Tamil';

  sourceLanguages: string[] = ['English', 'Sanskrit', 'Bengali'];
  targetLanguages: string[] = ['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi'];

  // Batch Processing State
  isProcessing: boolean = false;
  progressPercentage: number = 0;
  progressMessage: string = '';

  isCorrected: boolean = false;
  isCopied: boolean = false;
  errorMessage: string = '';
  readonly batchLimit: number = 3000;
  readonly maxChars: number = 10000;

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef,
  ) {}

  async onTranslate() {
    if (!this.sourceText.trim()) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.currentTranslation = null;
    this.progressPercentage = 0;
    this.progressMessage = 'Preparing batches...';
    this.cdr.detectChanges();

    try {
      const batches = this.splitIntoBatches(this.sourceText);
      let fullTranslation = '';

      for (let i = 0; i < batches.length; i++) {
        this.progressMessage = `Translating Part ${i + 1} of ${batches.length}...`;
        this.progressPercentage = Math.round((i / batches.length) * 100);
        this.cdr.detectChanges();

        const translatedBatch = await firstValueFrom(
          this.translationService.translateV1(batches[i]),
        );

        fullTranslation += (fullTranslation ? '\n\n' : '') + translatedBatch;
      }

      this.progressPercentage = 100;
      this.progressMessage = 'Finalizing translation...';
      this.cdr.detectChanges();

      // Save the final unified translation to history
      const finalObj: Translation = {
        sourceText: this.sourceText,
        translatedText: fullTranslation,
        sourceLanguage: this.sourceLanguage,
        targetLanguage: this.targetLanguage,
        approved: false,
      };

      this.translationService.saveFinal(finalObj).subscribe({
        next: (res) => {
          this.currentTranslation = res;
          this.correctedText = res.translatedText || '';
          this.isProcessing = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to save final translation', err);
          this.errorMessage = 'Translation complete, but failed to save to history.';
          this.isProcessing = false;
          this.cdr.detectChanges();
        },
      });
    } catch (err) {
      console.error('Translation failed', err);
      this.errorMessage = 'Translation failed during processing. Please check your connection.';
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  }

  private splitIntoBatches(text: string): string[] {
    const paragraphs = text.split(/\n\s*\n/);
    const batches: string[] = [];
    let currentBatch = '';

    for (const para of paragraphs) {
      if (currentBatch.length + para.length + 2 <= this.batchLimit) {
        currentBatch += (currentBatch ? '\n\n' : '') + para;
      } else {
        if (currentBatch) batches.push(currentBatch);

        // If a single paragraph is larger than the limit, we must split it by sentences
        if (para.length > this.batchLimit) {
          const subBatches = this.splitLargeParagraph(para);
          batches.push(...subBatches);
          currentBatch = '';
        } else {
          currentBatch = para;
        }
      }
    }
    if (currentBatch) batches.push(currentBatch);
    return batches;
  }

  private splitLargeParagraph(para: string): string[] {
    const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
    const subBatches: string[] = [];
    let currentSub = '';

    for (const sent of sentences) {
      if (currentSub.length + sent.length <= this.batchLimit) {
        currentSub += sent;
      } else {
        if (currentSub) subBatches.push(currentSub);
        currentSub = sent;
      }
    }
    if (currentSub) subBatches.push(currentSub);
    return subBatches;
  }

  onSaveCorrection(approved: boolean = false) {
    if (!this.currentTranslation?.id) return;

    this.isProcessing = true;
    this.cdr.detectChanges();
    this.translationService
      .updateCorrection(this.currentTranslation.id, this.correctedText, approved)
      .subscribe({
        next: (res) => {
          this.currentTranslation = res;
          this.isCorrected = true;
          this.isProcessing = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.isCorrected = false;
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to save correction.';
          this.isProcessing = false;
          this.cdr.detectChanges();
        },
      });
  }

  onCopy() {
    if (!this.correctedText) return;
    navigator.clipboard.writeText(this.correctedText).then(() => {
      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 2000);
    });
  }

  reset() {
    this.correctedText = this.currentTranslation?.translatedText || '';
  }
}
