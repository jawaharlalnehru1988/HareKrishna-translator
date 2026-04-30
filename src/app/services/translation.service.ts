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

  translate(sourceText: string): Observable<Translation> {
    return this.http.post<Translation>(this.apiUrl, { sourceText });
  }

  updateCorrection(id: number, correctedText: string, approved: boolean): Observable<Translation> {
    return this.http.put<Translation>(`${this.apiUrl}/${id}`, { correctedText, approved });
  }
}
