import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanskritTranslatorService, SanskritSloka } from '../services/sanskrit-translator.service';
import { GlossaryService, GlossaryEntry } from '../services/glossary.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sanskrit-translator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sanskrit-translator.html',
  styleUrl: './sanskrit-translator.scss',
})
export class SanskritTranslator {
  slokaNumber: string = '';
  sanskritText: string = '';
  
  currentSloka: SanskritSloka | null = null;
  
  // Editable fields for the result
  editedTransliteration: string = '';
  editedWordToWord: string = '';
  editedPurport: string = '';
  
  // Dictionary / Glossary
  newSourceWord: string = '';
  newTargetWord: string = '';
  showGlossaryModal: boolean = false;
  glossaryEntries: GlossaryEntry[] = [];

  isProcessing: boolean = false;
  isSaved: boolean = false;
  errorMessage: string = '';

  constructor(
    private translatorService: SanskritTranslatorService,
    private glossaryService: GlossaryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadGlossary();
  }

  loadGlossary() {
    this.glossaryService.getAll().subscribe(entries => {
      this.glossaryEntries = entries;
    });
  }

  onTranslate() {
    if (!this.sanskritText.trim()) return;
    
    this.isProcessing = true;
    this.errorMessage = '';
    this.currentSloka = null;
    this.cdr.detectChanges();
    
    this.translatorService.translate({
      slokaNumber: this.slokaNumber,
      sanskritText: this.sanskritText
    }).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.currentSloka = res;
        this.editedTransliteration = res.transliteration || '';
        this.editedWordToWord = res.wordToWordMeaning || '';
        this.editedPurport = res.purport || '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to translate. Please ensure GPT-4o is accessible and backend is running.';
        this.cdr.detectChanges();
      }
    });
  }

  onSave() {
    if (!this.currentSloka) return;
    
    const slokaToSave: SanskritSloka = {
      ...this.currentSloka,
      transliteration: this.editedTransliteration,
      wordToWordMeaning: this.editedWordToWord,
      purport: this.editedPurport,
      isApproved: true
    };

    this.isProcessing = true;
    this.translatorService.saveApproved(slokaToSave).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.isSaved = true;
        setTimeout(() => {
          this.isSaved = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to save the translation.';
      }
    });
  }

  addToGlossary() {
    if (!this.newSourceWord || !this.newTargetWord) return;

    const entry: GlossaryEntry = {
      sourceWord: this.newSourceWord,
      targetWord: this.newTargetWord
    };

    this.glossaryService.create(entry).subscribe(() => {
      this.loadGlossary();
      this.newSourceWord = '';
      this.newTargetWord = '';
      this.showGlossaryModal = false;
    });
  }

  deleteGlossaryEntry(id: number | undefined) {
    if (!id) return;
    this.glossaryService.delete(id).subscribe(() => {
      this.loadGlossary();
    });
  }

  toggleGlossary() {
    this.showGlossaryModal = !this.showGlossaryModal;
  }
}
