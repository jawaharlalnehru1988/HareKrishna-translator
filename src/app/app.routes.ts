import { Routes } from '@angular/router';
import { TranslationCorrector } from './translation-corrector/translation-corrector';
import { Translator } from './translator/translator';
import { SanskritTranslator } from './sanskrit-translator/sanskrit-translator';
import { Home } from './home/home';
import { History } from './history/history';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'translator', component: Translator },
  { path: 'sanskrit-tamil', component: SanskritTranslator, data: { language: 'TAMIL' } },
  { path: 'sanskrit-english', component: SanskritTranslator, data: { language: 'ENGLISH' } },
  { path: 'corrector', component: TranslationCorrector },
  { path: 'history', component: History }
];
