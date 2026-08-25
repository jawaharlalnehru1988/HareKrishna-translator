import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RamayanaService {
  private apiUrl = `${environment.apiUrl}/v1/ramayana`;

  constructor(private http: HttpClient) {}

  getToc(): Observable<any> {
    return this.http.get(`${this.apiUrl}/toc`);
  }

  getSloka(language: string, canto: number, chapter: number, verse: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${language}/${canto}/${chapter}/${verse}`);
  }

  getChapterSlokas(language: string, canto: number, chapter: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${language}/${canto}/${chapter}`);
  }
}
