import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RamayanaService } from '../services/ramayana.service';

@Component({
  selector: 'app-ramayana-reader',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ramayana-reader.html',
  styleUrls: ['./ramayana-reader.scss'],
})
export class RamayanaReaderComponent implements OnInit {
  language: 'english' | 'tamil' = 'english';

  toc: any[] = [];
  selectedCanto: any = null;
  selectedChapter: any = null;
  selectedVerse: number | null = null;

  currentSloka: any = null;
  loading: boolean = false;
  error: string = '';

  constructor(private ramayanaService: RamayanaService) {}

  ngOnInit(): void {
    this.loadToc();
  }

  loadToc() {
    this.ramayanaService.getToc().subscribe({
      next: (res: any[]) => {
        this.toc = res || [];
        if (this.toc.length > 0) {
          this.selectedCanto = this.toc[0];
          this.onCantoChange();
        }
      },
      error: (err) => {
        this.error = 'Failed to load table of contents.';
      },
    });
  }

  onCantoChange() {
    if (
      this.selectedCanto &&
      this.selectedCanto.chapters &&
      this.selectedCanto.chapters.length > 0
    ) {
      this.selectedChapter = this.selectedCanto.chapters[0];
      this.onChapterChange();
    } else {
      this.selectedChapter = null;
      this.selectedVerse = null;
      this.currentSloka = null;
    }
  }

  onChapterChange() {
    if (
      this.selectedChapter &&
      this.selectedChapter.verses &&
      this.selectedChapter.verses.length > 0
    ) {
      this.selectedVerse = this.selectedChapter.verses[0];
      this.fetchSloka();
    } else {
      this.selectedVerse = null;
      this.currentSloka = null;
    }
  }

  onVerseChange() {
    this.fetchSloka();
  }

  toggleLanguage() {
    this.language = this.language === 'english' ? 'tamil' : 'english';
    if (this.selectedVerse) {
      this.fetchSloka();
    }
  }

  fetchSloka() {
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
        error: (err) => {
          this.error = 'Failed to fetch the sloka. It may not exist in the selected language.';
          this.currentSloka = null;
          this.loading = false;
        },
      });
  }
}
