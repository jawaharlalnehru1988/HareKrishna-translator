import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-ramayana-extractor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ramayana-extractor.html',
  styleUrls: ['./ramayana-extractor.scss']
})
export class RamayanaExtractorComponent implements OnInit {
  rawWisdomlibText: string = '';
  
  // Extracted fields
  cantoName: string = 'Bala Kanda';
  cantoNumber: number = 1;
  chapterNumber: number = 1;
  verseNumber: number = 1;

  get slokaNumber(): string {
    return `${this.cantoName} ${this.chapterNumber}.${this.verseNumber}`;
  }
  
  sanskritSloka: string = '';
  slokaTransliteration: string = '';
  
  // AI Generated English fields
  wordToWordMeaning: string = '';
  translation: string = '';
  purport: string = '';
  generatePurport: boolean = false;
  
  // Tamil Translated fields
  tamilCantoName: string = 'பால காண்டம்';
  tamilSlokaNumber: string = '';
  tamilSanskritSloka: string = '';
  tamilSlokaTransliteration: string = '';
  tamilWordToWordMeaning: string = '';
  tamilTranslation: string = '';
  tamilPurport: string = '';

  get tamilSlokaNumberComputed(): string {
    return `${this.tamilCantoName} ${this.chapterNumber}.${this.verseNumber}`;
  }

  isGeneratingEnglish: boolean = false;
  isTranslatingTamil: boolean = false;
  isError: boolean = false;
  statusMessage: string = '';

  searchTimeout: any = null;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchSloka();
  }

  onLocationChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.fetchSloka();
    }, 300);
  }

  fetchSloka() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!this.cantoNumber || !this.chapterNumber || !this.verseNumber) {
      return;
    }

    this.adminService.getRamayanaSloka(this.cantoNumber, this.chapterNumber, this.verseNumber).subscribe({
      next: (res: any) => {
        if (res) {
          this.cantoName = res.cantoName || this.cantoName;
          this.tamilCantoName = res.cantoNameTa || this.tamilCantoName;
          this.sanskritSloka = res.sanskritSloka || '';
          this.slokaTransliteration = res.transliterationEn || '';
          this.wordToWordMeaning = res.wordToWordMeaningEn || '';
          this.translation = res.translationEn || '';
          this.purport = res.purportEn || '';
          this.generatePurport = !!res.purportEn;
          
          this.tamilSanskritSloka = res.sanskritSloka || '';
          this.tamilSlokaTransliteration = res.transliterationTa || '';
          this.tamilWordToWordMeaning = res.wordToWordMeaningTa || '';
          this.tamilTranslation = res.translationTa || '';
          this.tamilPurport = res.purportTa || '';

          this.statusMessage = 'Found existing verse content in database.';
          this.isError = false;
        } else {
          this.clearFieldsExceptLocation();
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.clearFieldsExceptLocation();
          this.statusMessage = 'Verse not found in database. Ready for new input.';
          this.isError = false;
        } else {
          this.statusMessage = 'Error checking database: ' + (err.error?.error || err.message);
          this.isError = true;
        }
        this.cdr.detectChanges();
      }
    });
  }

  clearFieldsExceptLocation() {
    this.rawWisdomlibText = '';
    this.sanskritSloka = '';
    this.slokaTransliteration = '';
    this.wordToWordMeaning = '';
    this.translation = '';
    this.purport = '';
    this.tamilSanskritSloka = '';
    this.tamilSlokaTransliteration = '';
    this.tamilWordToWordMeaning = '';
    this.tamilTranslation = '';
    this.tamilPurport = '';
  }

  extractFromRawText() {
    this.sanskritSloka = '';
    this.slokaTransliteration = '';
    
    if (!this.rawWisdomlibText) return;

    const lines = this.rawWisdomlibText.split('\n');
    let sanskrit = '';
    let trans = '';
    
    // Devanagari Unicode range: \u0900-\u097F
    const devanagariRegex = /[\u0900-\u097F]/;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        if (devanagariRegex.test(trimmed)) {
          sanskrit += trimmed + '\n';
        } else {
          trans += trimmed + '\n';
        }
      }
    });

    this.sanskritSloka = sanskrit.trim();
    this.slokaTransliteration = trans.trim();
    this.statusMessage = 'Extracted Sanskrit and Transliteration successfully.';
  }

  generateEnglish() {
    if (!this.sanskritSloka) {
      this.statusMessage = 'Please extract Sanskrit text first.';
      this.isError = true;
      return;
    }

    this.isGeneratingEnglish = true;
    this.statusMessage = 'AI is generating English Meaning, Translation and Purport...';
    this.isError = false;

    const payload = {
      slokaNumber: this.slokaNumber,
      sanskritSloka: this.sanskritSloka,
      slokaTransliteration: this.slokaTransliteration,
      purport: this.generatePurport ? 'GENERATE' : 'SKIP'
    };

    this.adminService.generateRamayanaEnglish(payload).subscribe({
      next: (res: any) => {
        this.wordToWordMeaning = res.wordToWordMeaning || '';
        this.translation = res.translation || '';
        this.purport = res.purport || '';
        this.statusMessage = 'English generation completed successfully.';
        this.isGeneratingEnglish = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.statusMessage = 'Failed to generate English: ' + (err.error?.error || err.message);
        this.isError = true;
        this.isGeneratingEnglish = false;
        this.cdr.detectChanges();
      }
    });
  }

  translateToTamil() {
    if (!this.sanskritSloka || !this.translation) {
      this.statusMessage = 'Please generate English translation first.';
      this.isError = true;
      return;
    }

    this.isTranslatingTamil = true;
    this.statusMessage = 'AI is translating to Tamil using ISKCON DB...';
    this.isError = false;

    const payload = {
      slokaNumber: this.slokaNumber,
      sanskritSloka: this.sanskritSloka,
      slokaTransliteration: this.slokaTransliteration,
      wordToWordMeaning: this.wordToWordMeaning,
      translation: this.translation,
      purport: this.generatePurport ? this.purport : ''
    };

    this.adminService.translateContextToTamil(payload).subscribe({
      next: (res: any) => {
        this.tamilSlokaNumber = res.slokaNumber || this.slokaNumber;
        this.tamilSanskritSloka = res.sanskritSloka || this.sanskritSloka;
        this.tamilSlokaTransliteration = res.slokaTransliteration || '';
        this.tamilWordToWordMeaning = res.wordToWordMeaning || '';
        this.tamilTranslation = res.translation || '';
        this.tamilPurport = this.generatePurport ? (res.purport || '') : '';
        
        this.statusMessage = 'Tamil Translation completed successfully.';
        this.isTranslatingTamil = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.statusMessage = 'Failed to translate to Tamil: ' + (err.error?.error || err.message);
        this.isError = true;
        this.isTranslatingTamil = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveToDatabase(override: boolean = false) {
    if (!this.sanskritSloka || !this.translation || !this.tamilTranslation) {
      this.statusMessage = 'Please complete both English and Tamil translations before saving.';
      this.isError = true;
      return;
    }

    const payload = {
      cantoName: this.cantoName,
      cantoNameTa: this.tamilCantoName,
      cantoNumber: this.cantoNumber,
      chapterNumber: this.chapterNumber,
      verseNumber: this.verseNumber,
      sanskritSloka: this.sanskritSloka,
      
      transliterationEn: this.slokaTransliteration,
      wordToWordMeaningEn: this.wordToWordMeaning,
      translationEn: this.translation,
      purportEn: this.generatePurport ? this.purport : '',
      
      transliterationTa: this.tamilSlokaTransliteration,
      wordToWordMeaningTa: this.tamilWordToWordMeaning,
      translationTa: this.tamilTranslation,
      purportTa: this.generatePurport ? this.tamilPurport : '',

      override: override
    };

    this.adminService.saveRamayana(payload).subscribe({
      next: (res: any) => {
        this.statusMessage = 'Successfully saved Ramayana verse to database!';
        this.isError = false;

        // Go to next empty form with verse number increased
        this.verseNumber++;
        this.fetchSloka();

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err.error?.requiresOverride) {
          const userConfirmed = window.confirm('Duplicate entry: This sloka already exists. Do you want to overwrite it?');
          if (userConfirmed) {
            this.saveToDatabase(true);
            return;
          } else {
            this.statusMessage = 'Save cancelled by user.';
            this.isError = false;
          }
        } else {
          this.statusMessage = 'Failed to save to database: ' + (err.error?.error || err.message);
          this.isError = true;
        }
        this.cdr.detectChanges();
      }
    });
  }
}
