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
  
  // Language Context
  moduleLanguage: 'TAMIL' | 'ENGLISH' = 'TAMIL';
  activeTab: 'TAMIL' | 'ENGLISH' = 'TAMIL';
  includePurport: boolean = true;
  
  // Hierarchy fields
  majorDivision: number | null = null;
  minorDivision: number | null = null;
  verseNumber: number | null = null;
  sanskritText: string = '';
  
  currentSloka: Sloka | null = null;
  
  // Editable fields for the result (Dynamic based on active tab)
  editedTransliteration: string = '';
  editedWordToWord: string = '';
  editedTranslation: string = '';
  editedPurport: string = '';
  
  // Dictionary / Glossary
  newSourceWord: string = '';
  newTargetWord: string = '';
  showGlossaryModal: boolean = false;
  glossaryEntries: GlossaryEntry[] = [];

  // Scripture Management
  showScriptureModal: boolean = false;
  newScriptureTitle: string = '';
  newMajorDivisionName: string = 'Kanda';
  newMinorDivisionName: string = 'Sarga';

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
    // Determine module language from route
    this.route.data.subscribe(data => {
      this.moduleLanguage = data['language'] || 'TAMIL';
      this.activeTab = this.moduleLanguage; // Default tab matches module
    });

    this.loadScriptures();
    this.loadGlossary();
  }

  loadScriptures() {
    this.scriptureService.getAll().subscribe({
      next: (res) => {
        this.scriptures = res;
        if (res.length > 0) {
          this.selectedScripture = res[0];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load scriptures', err);
        this.errorMessage = 'Could not load scriptures. Please check if the backend is running.';
        this.cdr.detectChanges();
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
    
    // Always use moduleLanguage for the API call to ensure full Agentic Graph execution
    this.translatorService.translate({
      scriptureId: this.selectedScripture.id,
      majorDivision: this.majorDivision || 0,
      minorDivision: this.minorDivision || 0,
      verseNumber: this.verseNumber || 0,
      sanskritText: this.sanskritText,
      targetLanguage: this.moduleLanguage,
      includePurport: this.includePurport
    }).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.currentSloka = res;
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
    
    if (this.activeTab === 'TAMIL') {
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
    
    if (this.activeTab === 'TAMIL') {
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

  onTabChange(tab: 'TAMIL' | 'ENGLISH') {
    this.activeTab = tab;
    this.syncEditableFields();
  }

  toggleScriptureModal() {
    this.showScriptureModal = !this.showScriptureModal;
  }

  addScripture() {
    if (!this.newScriptureTitle.trim()) return;

    const newBook: Partial<Scripture> = {
      title: this.newScriptureTitle,
      majorDivisionName: this.newMajorDivisionName,
      minorDivisionName: this.newMinorDivisionName,
      author: 'Unknown'
    };

    this.isProcessing = true;
    this.scriptureService.create(newBook).subscribe({
      next: (res) => {
        this.loadScriptures();
        this.selectedScripture = res;
        this.newScriptureTitle = '';
        this.showScriptureModal = false;
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to add new scripture.';
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }
}
