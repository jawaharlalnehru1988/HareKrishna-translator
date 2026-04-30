import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GlossaryEntry {
  id?: number;
  sourceWord: string;
  targetWord: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlossaryService {
  private apiUrl = `${environment.apiUrl}/glossary`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<GlossaryEntry[]> {
    return this.http.get<GlossaryEntry[]>(this.apiUrl);
  }

  create(entry: GlossaryEntry): Observable<GlossaryEntry> {
    return this.http.post<GlossaryEntry>(this.apiUrl, entry);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
