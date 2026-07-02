import { Routes } from '@angular/router';
import { TranslationCorrector } from './translation-corrector/translation-corrector';
import { Translator } from './translator/translator';
import { SanskritTranslator } from './sanskrit-translator/sanskrit-translator';
import { Home } from './home/home';
import { BooksList } from './books/books-list/books-list';
import { BookDetails } from './books/book-details/book-details';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { ContextExtractor } from './admin-dashboard/context-extractor/context-extractor';
import { RamayanaExtractorComponent } from './admin-dashboard/ramayana-extractor/ramayana-extractor';
import { RamayanaReaderComponent } from './ramayana-reader/ramayana-reader';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { PendingApproval } from './auth/pending-approval/pending-approval';
import { UserManagement } from './admin-dashboard/user-management/user-management';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'pending-approval', component: PendingApproval },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'translator', component: Translator, canActivate: [authGuard] },
  { path: 'sanskrit', component: SanskritTranslator, canActivate: [authGuard] },
  { path: 'sanskrit-tamil', redirectTo: 'sanskrit' },
  { path: 'sanskrit-english', redirectTo: 'sanskrit' },
  { path: 'corrector', component: TranslationCorrector, canActivate: [authGuard] },
  { path: 'books', component: BooksList },
  { path: 'books/:title/:language', component: BookDetails },
  { path: 'admin', component: AdminDashboard, canActivate: [authGuard, adminGuard] },
  { path: 'admin/users', component: UserManagement, canActivate: [authGuard, adminGuard] },
  { path: 'extractor', component: ContextExtractor, canActivate: [authGuard, adminGuard] },
  { path: 'ramayana-extractor', component: RamayanaExtractorComponent, canActivate: [authGuard, adminGuard] },
  { path: 'ramayana', component: RamayanaReaderComponent, canActivate: [authGuard] }
];
