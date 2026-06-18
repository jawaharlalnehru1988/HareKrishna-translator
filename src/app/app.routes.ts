import { Routes } from '@angular/router';
import { TranslationCorrector } from './translation-corrector/translation-corrector';
import { Translator } from './translator/translator';
import { SanskritTranslator } from './sanskrit-translator/sanskrit-translator';
import { Home } from './home/home';
import { History } from './history/history';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { ContextExtractor } from './admin-dashboard/context-extractor/context-extractor';
import { RamayanaExtractorComponent } from './admin-dashboard/ramayana-extractor/ramayana-extractor';
import { RamayanaReaderComponent } from './ramayana-reader/ramayana-reader';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'translator', component: Translator },
  { path: 'sanskrit', component: SanskritTranslator },
  { path: 'sanskrit-tamil', redirectTo: 'sanskrit' },
  { path: 'sanskrit-english', redirectTo: 'sanskrit' },
  { path: 'corrector', component: TranslationCorrector },
  { path: 'history', component: History },
  { path: 'admin', component: AdminDashboard },
  { path: 'extractor', component: ContextExtractor },
  { path: 'ramayana-extractor', component: RamayanaExtractorComponent },
  { path: 'ramayana', component: RamayanaReaderComponent }
];
