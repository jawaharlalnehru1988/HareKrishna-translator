import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  modules = [
    {
      title: 'Universal Translator',
      description: 'AI-powered translation for Sanskrit and Hindi texts into fluent English.',
      route: '/translator',
      icon: '🌐',
      color: '#4F46E5'
    },
    {
      title: 'Sanskrit Sloka Translator',
      description: 'AI-powered word-for-word translation for Sanskrit slokas with Tamil and English support.',
      route: '/sanskrit',
      icon: '📜',
      color: '#FF9933'
    },
    {
      title: 'Translation Corrector',
      description: 'Refine existing translations with AI-suggested improvements and grammatical fixes.',
      route: '/corrector',
      icon: '✨',
      color: '#10B981'
    },
    {
      title: 'Archives & History',
      description: 'Access and manage your previous translation projects and corrections.',
      route: '/history',
      icon: '📚',
      color: '#6B7280'
    }
  ];
}
