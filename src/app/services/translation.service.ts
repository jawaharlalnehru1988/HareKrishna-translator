import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Translation {
  id?: number;
  sourceText: string;
  translatedText?: string;
  correctedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  createdAt?: string;
  approved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiUrl = `${environment.apiUrl}/translations`;

  constructor(private http: HttpClient) {}

  getAllTranslations(): Observable<Translation[]> {
    return this.http.get<Translation[]>(this.apiUrl);
  }

  // Translates a single batch (no DB save)
  translateBatch(sourceText: string, sourceLanguage: string, targetLanguage: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/batch`, 
      { sourceText, sourceLanguage, targetLanguage },
      { responseType: 'text' }
    );
  }

  // Saves the final combined translation to DB
  saveFinal(translation: Translation): Observable<Translation> {
    return this.http.post<Translation>(`${this.apiUrl}/save`, translation);
  }

  updateCorrection(id: number, correctedText: string, approved: boolean): Observable<Translation> {
    return this.http.put<Translation>(`${this.apiUrl}/${id}`, { correctedText, approved });
  }
}
