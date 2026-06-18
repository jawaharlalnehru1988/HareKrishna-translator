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

  extractContext(url: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/scraper/extract`, { url });
  }

  translateContextToTamil(context: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/scraper/translate-tamil`, context);
  }

  generateRamayanaEnglish(context: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/scraper/generate-ramayana`, context);
  }

  saveRamayana(context: any): Observable<any> {
    // Note: URL doesn't use the /admin prefix if we set it up differently in RamayanaController.
    // Let's verify: RamayanaController is mapped to /api/v1/ramayana and has /admin/save
    return this.http.post(`${environment.apiUrl}/v1/ramayana/admin/save`, context);
  }
}
