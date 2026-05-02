import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanskritTranslatorService, Sloka } from '../services/sanskrit-translator.service';
import { GlossaryService, GlossaryEntry } from '../services/glossary.service';
import { ScriptureService, Scripture } from '../services/scripture.service';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sanskrit-translator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sanskrit-translator.html',
  styleUrl: './sanskrit-translator.scss',
})
export class SanskritTranslator implements OnInit {
  // Scripture Selection
  scriptures: Scripture[] = [];
  selectedScripture: Scripture | null = null;
  
  // Language Selection
  targetLanguage: 'TAMIL' | 'ENGLISH' = 'TAMIL';
  
  // Hierarchy fields
  majorDivision: number | null = null;
  minorDivision: number | null = null;
  verseNumber: number | null = null;
  sanskritText: string = '';
  
  currentSloka: Sloka | null = null;
  
  // Editable fields for the result (Dynamic based on language)
  editedTransliteration: string = '';
  editedWordToWord: string = '';
  editedTranslation: string = '';
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
    private scriptureService: ScriptureService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Determine language from route
    this.route.data.subscribe(data => {
      if (data['language']) {
        this.targetLanguage = data['language'];
      }
    });

    this.loadScriptures();
    this.loadGlossary();
  }

  loadScriptures() {
    this.scriptureService.getAll().subscribe(res => {
      this.scriptures = res;
      if (res.length > 0) {
        this.selectedScripture = res[0];
      }
    });
  }

  loadGlossary() {
    this.glossaryService.getAll().subscribe(entries => {
      this.glossaryEntries = entries;
    });
  }

  onTranslate() {
    if (!this.sanskritText.trim() || !this.selectedScripture) return;
    
    this.isProcessing = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    this.translatorService.translate({
      scriptureId: this.selectedScripture.id,
      majorDivision: this.majorDivision || 0,
      minorDivision: this.minorDivision || 0,
      verseNumber: this.verseNumber || 0,
      sanskritText: this.sanskritText,
      targetLanguage: this.targetLanguage
    }).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        if (this.currentSloka && this.currentSloka.sanskritText === res.sanskritText) {
           if (this.targetLanguage === 'TAMIL') {
             this.currentSloka.transliteration = res.transliteration;
             this.currentSloka.wordToWordMeaning = res.wordToWordMeaning;
             this.currentSloka.translation = res.translation;
             this.currentSloka.purport = res.purport;
           } else {
             this.currentSloka.transliterationEn = res.transliterationEn;
             this.currentSloka.wordToWordMeaningEn = res.wordToWordMeaningEn;
             this.currentSloka.translationEn = res.translationEn;
             this.currentSloka.purportEn = res.purportEn;
           }
        } else {
          this.currentSloka = res;
        }

        this.syncEditableFields();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to translate. Please ensure the backend is running.';
        this.cdr.detectChanges();
      }
    });
  }

  syncEditableFields() {
    if (!this.currentSloka) return;
    if (this.targetLanguage === 'TAMIL') {
      this.editedTransliteration = this.currentSloka.transliteration || '';
      this.editedWordToWord = this.currentSloka.wordToWordMeaning || '';
      this.editedTranslation = this.currentSloka.translation || '';
      this.editedPurport = this.currentSloka.purport || '';
    } else {
      this.editedTransliteration = this.currentSloka.transliterationEn || '';
      this.editedWordToWord = this.currentSloka.wordToWordMeaningEn || '';
      this.editedTranslation = this.currentSloka.translationEn || '';
      this.editedPurport = this.currentSloka.purportEn || '';
    }
  }

  onSave() {
    if (!this.currentSloka) return;
    
    if (this.targetLanguage === 'TAMIL') {
      this.currentSloka.transliteration = this.editedTransliteration;
      this.currentSloka.wordToWordMeaning = this.editedWordToWord;
      this.currentSloka.translation = this.editedTranslation;
      this.currentSloka.purport = this.editedPurport;
    } else {
      this.currentSloka.transliterationEn = this.editedTransliteration;
      this.currentSloka.wordToWordMeaningEn = this.editedWordToWord;
      this.currentSloka.translationEn = this.editedTranslation;
      this.currentSloka.purportEn = this.editedPurport;
    }

    const slokaToSave: Sloka = {
      ...this.currentSloka,
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

  onScriptureChange() {
    this.majorDivision = null;
    this.minorDivision = null;
    this.verseNumber = null;
  }

  onLanguageChange() {
    this.syncEditableFields();
  }
}
