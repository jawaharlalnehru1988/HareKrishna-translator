import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Scripture {
  id: number;
  title: string;
  author: string;
  majorDivisionName: string;
  minorDivisionName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScriptureService {
  private apiUrl = `${environment.apiUrl}/scriptures`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Scripture[]> {
    return this.http.get<Scripture[]>(this.apiUrl);
  }

  create(scripture: Partial<Scripture>): Observable<Scripture> {
    return this.http.post<Scripture>(this.apiUrl, scripture);
  }
}
