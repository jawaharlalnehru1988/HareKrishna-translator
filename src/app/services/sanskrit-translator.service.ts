import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SanskritSloka {
  id?: number;
  slokaNumber?: string;
  sanskritText: string;
  transliteration?: string;
  wordToWordMeaning?: string;
  purport?: string;
  isApproved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SanskritTranslatorService {
  private apiUrl = `${environment.apiUrl}/translator/sanskrit`;

  constructor(private http: HttpClient) {}

  translate(request: { slokaNumber?: string, sanskritText: string }): Observable<SanskritSloka> {
    return this.http.post<SanskritSloka>(`${this.apiUrl}/translate`, request);
  }

  saveApproved(sloka: SanskritSloka): Observable<SanskritSloka> {
    return this.http.post<SanskritSloka>(`${this.apiUrl}/save`, sloka);
  }

  getHistory(): Observable<SanskritSloka[]> {
    return this.http.get<SanskritSloka[]>(`${this.apiUrl}/history`);
  }
}
