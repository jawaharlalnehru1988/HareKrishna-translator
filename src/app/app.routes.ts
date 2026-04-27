import { Routes } from '@angular/router';
import { TranslationCorrector } from './translation-corrector/translation-corrector';
import { Home } from './home/home';
import { History } from './history/history';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'corrector', component: TranslationCorrector },
  { path: 'history', component: History }
];
