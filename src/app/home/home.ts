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
    },
    {
      title: 'Context Extractor',
      description: 'Extract Bhagavad Gita slokas and purports directly from Vedabase URLs.',
      route: '/extractor',
      icon: '🔍',
      color: '#06B6D4'
    },
    {
      title: 'Train the Translator',
      description: 'Manage translations, users, and system configuration.',
      route: '/admin',
      icon: '⚙️',
      color: '#8B5CF6'
    },
    {
      title: 'Ramayana Extractor',
      description: 'Extract and generate English/Tamil context for Ramayana slokas from WisdomLib.',
      route: '/ramayana-extractor',
      icon: '🏹',
      color: '#EAB308'
    }
  ];
}
