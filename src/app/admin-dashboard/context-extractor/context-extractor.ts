import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-context-extractor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './context-extractor.html',
  styleUrls: ['./context-extractor.scss']
})
export class ContextExtractor {
  url: string = '';
  isLoading: boolean = false;
  isTranslating: boolean = false;
  statusMessage: string = '';
  isError: boolean = false;

  sources = [
    { name: 'Vedabase', baseUrl: 'https://vedabase.io/en/library/' },
    { name: 'Prabhupada.io', baseUrl: 'https://prabhupada.io/' }
  ];
  selectedSource = this.sources[1]; // Set Prabhupada.io as default
  bookCode = 'bg';
  chapterNum = 1;
  slokaNum = 1;

  get constructedUrl(): string {
    return `${this.selectedSource.baseUrl}${this.bookCode}/${this.chapterNum}/${this.slokaNum}/`;
  }

  slokaNumber: string = '';
  sanskritSloka: string = '';
  slokaTransliteration: string = '';
  wordToWordMeaning: string = '';
  translation: string = '';
  purport: string = '';

  // Tamil translated fields
  tamilSlokaNumber: string = '';
  tamilSanskritSloka: string = '';
  tamilSlokaTransliteration: string = '';
  tamilWordToWordMeaning: string = '';
  tamilTranslation: string = '';
  tamilPurport: string = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  fetchContext() {
    this.url = this.constructedUrl;
    this.isLoading = true;
    this.statusMessage = 'Fetching context from ' + this.url + '...';
    this.isError = false;
    this.cdr.detectChanges();

    this.adminService.extractContext(this.url).subscribe({
      next: (res: any) => this.updateFields(res),
      error: (err: any) => {
        this.isError = true;
        this.statusMessage = err.error?.error || 'Failed to extract context.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateFields(res: any) {
    this.slokaNumber = res.slokaNumber || '';
    this.sanskritSloka = res.sanskritSloka || '';
    this.slokaTransliteration = res.slokaTransliteration || '';
    this.wordToWordMeaning = res.wordToWordMeaning || '';
    this.translation = res.translation || '';
    this.purport = res.purport || '';
    
    this.statusMessage = 'Context successfully extracted!';
    this.isLoading = false;
    
    // Clear Tamil fields on new extraction
    this.tamilSlokaNumber = '';
    this.tamilSanskritSloka = '';
    this.tamilSlokaTransliteration = '';
    this.tamilWordToWordMeaning = '';
    this.tamilTranslation = '';
    this.tamilPurport = '';
    
    this.cdr.detectChanges();
  }

  fetchNextSloka() {
    this.slokaNum++;
    this.url = this.constructedUrl;
    
    this.isLoading = true;
    this.statusMessage = `Fetching next sloka: ${this.chapterNum}.${this.slokaNum}...`;
    this.isError = false;
    this.cdr.detectChanges();

    this.adminService.extractContext(this.url).subscribe({
      next: (res: any) => this.updateFields(res),
      error: (err: any) => {
        // If it fails (like a 404 when the chapter is over), try the next chapter
        this.chapterNum++;
        this.slokaNum = 1;
        this.url = this.constructedUrl;
        
        this.statusMessage = `Chapter ended. Fetching next chapter: ${this.chapterNum}.${this.slokaNum}...`;
        this.cdr.detectChanges();
        
        this.adminService.extractContext(this.url).subscribe({
           next: (res2: any) => this.updateFields(res2),
           error: (err2: any) => {
               this.isError = true;
               this.statusMessage = 'Failed to fetch next chapter. End of book?';
               this.isLoading = false;
               this.cdr.detectChanges();
           }
        });
      }
    });
  }

  saveToDatabase() {
    // For now, this is a placeholder. 
    // You can later implement saving logic and integration with Vector DB
    this.statusMessage = 'Data ready to be saved / translated to Tamil!';
  }

  translateToTamil() {
    if (!this.slokaNumber && !this.sanskritSloka) {
      this.statusMessage = 'Extract a context first before translating.';
      this.isError = true;
      return;
    }

    this.isTranslating = true;
    this.statusMessage = 'Translating context to Tamil (this may take a minute)...';
    this.isError = false;

    const payload = {
      slokaNumber: this.slokaNumber,
      sanskritSloka: this.sanskritSloka,
      slokaTransliteration: this.slokaTransliteration,
      wordToWordMeaning: this.wordToWordMeaning,
      translation: this.translation,
      purport: this.purport
    };

    this.adminService.translateContextToTamil(payload).subscribe({
      next: (res: any) => {
        this.tamilSlokaNumber = res.slokaNumber || this.slokaNumber;
        this.tamilSanskritSloka = res.sanskritSloka || this.sanskritSloka;
        this.tamilSlokaTransliteration = res.slokaTransliteration || '';
        this.tamilWordToWordMeaning = res.wordToWordMeaning || '';
        this.tamilTranslation = res.translation || '';
        this.tamilPurport = res.purport || '';
        
        this.statusMessage = 'Context successfully translated to Tamil!';
        this.isTranslating = false;
        this.isError = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.statusMessage = 'Failed to translate context: ' + (err.error?.error || err.message);
        this.isError = true;
        this.isTranslating = false;
        this.cdr.detectChanges();
      }
    });
  }
}
