import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService, Translation } from '../services/translation.service';

@Component({
  selector: 'app-translation-corrector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './translation-corrector.html',
  styleUrl: './translation-corrector.scss',
})
export class TranslationCorrector {
  sourceText: string = '';
  currentTranslation: Translation | null = null;
  correctedText: string = '';
  isProcessing: boolean = false;
  isCorrected: boolean = false;
  errorMessage: string = '';

  constructor(private translationService: TranslationService) {}

  onTranslate() {
    if (!this.sourceText.trim()) return;
    
    this.isProcessing = true;
    this.errorMessage = '';
    this.currentTranslation = null;
    
    this.translationService.translate(this.sourceText).subscribe({
      next: (res) => {
        this.currentTranslation = res;
        this.correctedText = res.translatedText || '';
        this.isProcessing = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to translate. Please check if the backend is running.';
        this.isProcessing = false;
      }
    });
  }

  onSaveCorrection(approved: boolean = false) {
    if (!this.currentTranslation?.id) return;
    
    this.isProcessing = true;
    this.translationService.updateCorrection(
      this.currentTranslation.id, 
      this.correctedText, 
      approved
    ).subscribe({
      next: (res) => {
        this.currentTranslation = res;
        this.isProcessing = false;
        this.isCorrected = true;
        setTimeout(() => this.isCorrected = false, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to save correction.';
        this.isProcessing = false;
      }
    });
  }

  reset() {
    this.correctedText = this.currentTranslation?.translatedText || '';
  }
}
