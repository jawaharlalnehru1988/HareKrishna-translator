import { Routes } from '@angular/router';
import { TranslationCorrector } from './translation-corrector/translation-corrector';
import { Translator } from './translator/translator';
import { Home } from './home/home';
import { History } from './history/history';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'translator', component: Translator },
  { path: 'corrector', component: TranslationCorrector },
  { path: 'history', component: History }
];
