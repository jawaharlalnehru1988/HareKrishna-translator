import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './nav-bar/nav-bar';
import { TranslationCorrector } from './translation-corrector/translation-corrector';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBar, TranslationCorrector],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Hare Krishna Translator');
}
