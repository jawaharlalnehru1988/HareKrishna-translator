import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sloka {
  id?: number;
  scriptureId: number;
  scriptureTitle?: string;
  majorDivision: number;
  minorDivision: number;
  verseNumber: number;
  sanskritText: string;
  transliteration?: string;
  wordToWordMeaning?: string;
  translation?: string;
  purport?: string;
  isApproved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SanskritTranslatorService {
  private apiUrl = `${environment.apiUrl}/translator/sanskrit`;

  constructor(private http: HttpClient) {}

  translate(request: { 
    scriptureId: number, 
    majorDivision: number, 
    minorDivision: number, 
    verseNumber: number,
    sanskritText: string 
  }): Observable<Sloka> {
    return this.http.post<Sloka>(`${this.apiUrl}/translate`, request);
  }

  saveApproved(sloka: Sloka): Observable<Sloka> {
    return this.http.post<Sloka>(`${this.apiUrl}/save`, sloka);
  }

  getHistory(): Observable<Sloka[]> {
    return this.http.get<Sloka[]>(`${this.apiUrl}/history`);
  }
}
