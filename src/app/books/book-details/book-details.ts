import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RamayanaService } from '../../services/ramayana.service';
import { SanskritTranslatorService, Sloka } from '../../services/sanskrit-translator.service';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.scss']
})
export class BookDetails implements OnInit {
  bookTitle = '';
  language = '';
  
  isLoading = true;
  
  // Ramayana data
  ramayanaToc: any[] = [];
  expandedCanto: number | null = null;
  expandedChapter: number | null = null;
  slokaDetails: { [key: string]: any } = {};

  // Bhagavad Gita (or generic) data
  genericSlokasByChapter: { [chapter: number]: Sloka[] } = {};
  chapterKeys: number[] = [];
  expandedGenericChapter: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private ramayanaService: RamayanaService,
    private sanskritService: SanskritTranslatorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookTitle = params.get('title') || '';
      this.language = params.get('language') || '';
      console.log('BookDetails initialized with title:', this.bookTitle, 'language:', this.language);
      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;
    const normalizedTitle = this.bookTitle.toLowerCase();
    
    if (normalizedTitle === 'ramayana') {
      console.log('Fetching Ramayana TOC...');
      this.ramayanaService.getToc().subscribe({
        next: (toc) => {
          console.log('Successfully fetched Ramayana TOC:', toc);
          this.ramayanaToc = toc;
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection
        },
        error: (err) => {
          console.error('Failed to load Ramayana TOC', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('Fetching Generic History...');
      this.sanskritService.getHistory().subscribe({
        next: (history) => {
          console.log('Successfully fetched Generic History');
          const filtered = history.filter(s => 
            s.scriptureTitle?.toLowerCase().includes(normalizedTitle)
          );
          
          this.genericSlokasByChapter = {};
          filtered.forEach(sloka => {
            const ch = sloka.majorDivision;
            if (!this.genericSlokasByChapter[ch]) {
              this.genericSlokasByChapter[ch] = [];
            }
            this.genericSlokasByChapter[ch].push(sloka);
          });
          
          this.chapterKeys = Object.keys(this.genericSlokasByChapter)
            .map(k => parseInt(k, 10))
            .sort((a, b) => a - b);
            
          this.chapterKeys.forEach(ch => {
            this.genericSlokasByChapter[ch].sort((a, b) => a.verseNumber - b.verseNumber);
          });

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load generic history', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  getSlokaKey(cantoNum: number, chapterNum: number, verseNum: number): string {
    return `${cantoNum}-${chapterNum}-${verseNum}`;
  }

  toggleCanto(cantoNum: number) {
    this.expandedCanto = this.expandedCanto === cantoNum ? null : cantoNum;
  }

  toggleChapter(chapterNum: number) {
    this.expandedChapter = this.expandedChapter === chapterNum ? null : chapterNum;
  }

  toggleVerse(cantoNum: number, chapterNum: number, verseNum: number) {
    const key = this.getSlokaKey(cantoNum, chapterNum, verseNum);
    
    if (this.slokaDetails[key]) {
      this.slokaDetails[key] = null;
    } else {
      this.slokaDetails[key] = { loading: true };
      this.ramayanaService.getSloka(this.language, cantoNum, chapterNum, verseNum).subscribe({
        next: (data) => {
          this.slokaDetails[key] = data;
          this.slokaDetails[key].loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load verse details', err);
          this.slokaDetails[key] = { error: 'Failed to load details.', loading: false };
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleGenericChapter(chapterNum: number) {
    this.expandedGenericChapter = this.expandedGenericChapter === chapterNum ? null : chapterNum;
  }
}
