import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RamayanaService } from '../services/ramayana.service';

@Component({
  selector: 'app-ramayana-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ramayana-reader.html',
  styleUrls: ['./ramayana-reader.scss'],
})
export class RamayanaReaderComponent implements OnInit {
  language: 'english' | 'tamil' = 'english';
  viewMode: 'single' | 'continuous' = 'single';
  theme: 'light' | 'sepia' | 'dark' = 'light';
  fontSize: number = 17;

  // Section visibility toggles
  showSanskrit: boolean = true;
  showTransliteration: boolean = true;
  showSynonyms: boolean = true;
  showTranslation: boolean = true;
  showPurport: boolean = true;

  toc: any[] = [];
  selectedCanto: any = null;
  selectedChapter: any = null;
  selectedVerse: number | null = 1;

  currentSloka: any = null;
  chapterSlokas: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private ramayanaService: RamayanaService) {}

  ngOnInit(): void {
    this.loadToc();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.viewMode === 'single' && !this.loading) {
      if (event.key === 'ArrowLeft') {
        this.goToPreviousVerse();
      } else if (event.key === 'ArrowRight') {
        this.goToNextVerse();
      }
    }
  }

  loadToc() {
    this.loading = true;
    this.ramayanaService.getToc().subscribe({
      next: (res: any[]) => {
        this.toc = res || [];
        if (this.toc.length > 0) {
          this.selectedCanto = this.toc[0];
          if (this.selectedCanto.chapters && this.selectedCanto.chapters.length > 0) {
            this.selectedChapter = this.selectedCanto.chapters[0];
            this.selectedVerse = this.selectedChapter.verses?.[0] || 1;
            this.loadContent();
          }
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load table of contents.';
        this.loading = false;
      },
    });
  }

  onCantoChange() {
    if (this.selectedCanto?.chapters?.length > 0) {
      this.selectedChapter = this.selectedCanto.chapters[0];
      this.selectedVerse = this.selectedChapter.verses?.[0] || 1;
      this.loadContent();
    }
  }

  onChapterChange() {
    if (this.selectedChapter?.verses?.length > 0) {
      this.selectedVerse = this.selectedChapter.verses[0];
      this.loadContent();
    }
  }

  onVerseChange() {
    if (this.viewMode === 'single') {
      this.fetchSingleSloka();
    } else {
      this.scrollToVerse(this.selectedVerse);
    }
  }

  selectVerseDirectly(verse: number) {
    this.selectedVerse = verse;
    if (this.viewMode === 'single') {
      this.fetchSingleSloka();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.scrollToVerse(verse);
    }
  }

  scrollToVerse(verseNumber: number | null) {
    if (!verseNumber) return;
    const element = document.getElementById('verse-' + verseNumber);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleLanguage(lang: 'english' | 'tamil') {
    if (this.language === lang) return;
    this.language = lang;
    this.loadContent();
  }

  setViewMode(mode: 'single' | 'continuous') {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.loadContent();
  }

  setTheme(themeName: 'light' | 'sepia' | 'dark') {
    this.theme = themeName;
  }

  changeFontSize(delta: number) {
    const nextSize = this.fontSize + delta;
    if (nextSize >= 13 && nextSize <= 26) {
      this.fontSize = nextSize;
    }
  }

  loadContent() {
    if (this.viewMode === 'single') {
      this.fetchSingleSloka();
    } else {
      this.fetchChapterSlokas();
    }
  }

  fetchSingleSloka() {
    if (!this.selectedCanto || !this.selectedChapter || !this.selectedVerse) return;

    this.loading = true;
    this.error = '';

    this.ramayanaService
      .getSloka(
        this.language,
        this.selectedCanto.cantoNumber,
        this.selectedChapter.chapterNumber,
        this.selectedVerse,
      )
      .subscribe({
        next: (res) => {
          this.currentSloka = res;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to fetch sloka.';
          this.currentSloka = null;
          this.loading = false;
        },
      });
  }

  fetchChapterSlokas() {
    if (!this.selectedCanto || !this.selectedChapter) return;

    this.loading = true;
    this.error = '';

    this.ramayanaService
      .getChapterSlokas(
        this.language,
        this.selectedCanto.cantoNumber,
        this.selectedChapter.chapterNumber,
      )
      .subscribe({
        next: (res: any[]) => {
          this.chapterSlokas = res || [];
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to fetch chapter slokas.';
          this.chapterSlokas = [];
          this.loading = false;
        },
      });
  }

  hasPreviousVerse(): boolean {
    if (!this.selectedChapter?.verses || !this.selectedVerse) return false;
    const idx = this.selectedChapter.verses.indexOf(this.selectedVerse);
    return idx > 0 || this.hasPreviousChapter();
  }

  hasNextVerse(): boolean {
    if (!this.selectedChapter?.verses || !this.selectedVerse) return false;
    const idx = this.selectedChapter.verses.indexOf(this.selectedVerse);
    return idx < this.selectedChapter.verses.length - 1 || this.hasNextChapter();
  }

  hasPreviousChapter(): boolean {
    if (!this.selectedCanto?.chapters || !this.selectedChapter) return false;
    const idx = this.selectedCanto.chapters.findIndex(
      (c: any) => c.chapterNumber === this.selectedChapter.chapterNumber,
    );
    return idx > 0;
  }

  hasNextChapter(): boolean {
    if (!this.selectedCanto?.chapters || !this.selectedChapter) return false;
    const idx = this.selectedCanto.chapters.findIndex(
      (c: any) => c.chapterNumber === this.selectedChapter.chapterNumber,
    );
    return idx < this.selectedCanto.chapters.length - 1;
  }

  goToPreviousVerse() {
    if (!this.selectedChapter?.verses || !this.selectedVerse) return;
    const idx = this.selectedChapter.verses.indexOf(this.selectedVerse);
    if (idx > 0) {
      this.selectedVerse = this.selectedChapter.verses[idx - 1];
      this.fetchSingleSloka();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (this.hasPreviousChapter()) {
      const chIdx = this.selectedCanto.chapters.findIndex(
        (c: any) => c.chapterNumber === this.selectedChapter.chapterNumber,
      );
      this.selectedChapter = this.selectedCanto.chapters[chIdx - 1];
      const verses = this.selectedChapter.verses;
      this.selectedVerse = verses[verses.length - 1];
      this.fetchSingleSloka();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToNextVerse() {
    if (!this.selectedChapter?.verses || !this.selectedVerse) return;
    const idx = this.selectedChapter.verses.indexOf(this.selectedVerse);
    if (idx < this.selectedChapter.verses.length - 1) {
      this.selectedVerse = this.selectedChapter.verses[idx + 1];
      this.fetchSingleSloka();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (this.hasNextChapter()) {
      const chIdx = this.selectedCanto.chapters.findIndex(
        (c: any) => c.chapterNumber === this.selectedChapter.chapterNumber,
      );
      this.selectedChapter = this.selectedCanto.chapters[chIdx + 1];
      this.selectedVerse = this.selectedChapter.verses[0];
      this.fetchSingleSloka();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  formatSanskrit(text: string): string {
    if (!text) return '';
    let result = text;
    result = result.replace(/॥/g, '@@DOUBLE_DANDA@@');
    result = result.replace(/।\s*/g, '।\n');
    result = result.replace(/@@DOUBLE_DANDA@@/g, '॥');
    return result;
  }

  formatTransliteration(text: string): string {
    if (!text) return '';
    let result = text;
    result = result.replace(/\|\|/g, '@@DOUBLE_PIPE@@');
    result = result.replace(/\|\s*/g, '|\n');
    result = result.replace(/@@DOUBLE_PIPE@@/g, '||');
    return result;
  }
}
