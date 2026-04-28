import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService, Translation } from '../services/translation.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-translator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './translator.html',
  styleUrl: './translator.scss',
})
export class Translator {
  sourceText: string = '';
  currentTranslation: Translation | null = null;
  correctedText: string = '';
  isProcessing: boolean = false;
  isCorrected: boolean = false;
  isCopied: boolean = false;
  errorMessage: string = '';
  readonly maxChars: number = 3000;

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  onTranslate() {
    if (!this.sourceText.trim()) return;
    
    if (this.sourceText.length > this.maxChars) {
      this.errorMessage = `Text is too long. Please limit your input to ${this.maxChars} characters for the best spiritual accuracy.`;
      return;
    }
    this.isProcessing = true;
    this.errorMessage = '';
    this.currentTranslation = null;
    this.cdr.detectChanges();
    
    this.translationService.translate(this.sourceText).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.currentTranslation = res;
        this.correctedText = res.translatedText || '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to translate. Please check if the backend is running.';
        this.cdr.detectChanges();
      }
    });
  }

  onSaveCorrection(approved: boolean = false) {
    if (!this.currentTranslation?.id) return;
    
    this.isProcessing = true;
    this.cdr.detectChanges();
    this.translationService.updateCorrection(
      this.currentTranslation.id, 
      this.correctedText, 
      approved
    ).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.currentTranslation = res;
        this.isCorrected = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.isCorrected = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to save correction.';
        this.cdr.detectChanges();
      }
    });
  }

  onCopy() {
    if (!this.correctedText) return;
    
    navigator.clipboard.writeText(this.correctedText).then(() => {
      this.isCopied = true;
      setTimeout(() => this.isCopied = false, 2000);
    });
  }

  reset() {
    this.correctedText = this.currentTranslation?.translatedText || '';
  }
}
