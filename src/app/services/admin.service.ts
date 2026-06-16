import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/v1/admin`;

  constructor(private http: HttpClient) {}

  uploadExcel(file: File, type: string): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post(`${this.apiUrl}/upload-excel`, formData, { responseType: 'text' });
  }

  submitFeedback(englishText: string, correctedTamilText: string, type: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/feedback`, 
      { englishText, correctedTamilText, type },
      { responseType: 'text' }
    );
  }
}
