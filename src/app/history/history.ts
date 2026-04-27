import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Translation } from '../services/translation.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  translations: Translation[] = [];
  isLoading: boolean = true;

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.translationService.getAllTranslations().subscribe({
      next: (res) => {
        this.translations = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.isLoading = false;
      }
    });
  }
}
