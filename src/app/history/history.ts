import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SanskritTranslatorService, Sloka } from '../services/sanskrit-translator.service';
import { TranslationService, Translation } from '../services/translation.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  sanskritSlokas: Sloka[] = [];
  basicTranslations: Translation[] = [];
  isLoading: boolean = true;
  activeFilter: 'ALL' | 'SANSKRIT' | 'BASIC' = 'ALL';

  constructor(
    private sanskritService: SanskritTranslatorService,
    private basicService: TranslationService
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    forkJoin({
      sanskrit: this.sanskritService.getHistory(),
      basic: this.basicService.getAllTranslations()
    }).subscribe({
      next: (res) => {
        this.sanskritSlokas = res.sanskrit;
        this.basicTranslations = res.basic;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.isLoading = false;
      }
    });
  }
}
