import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvaluationRequest {
  englishText: string;
  tamilTranslation: string;
}

export interface EvaluationResponse {
  suggestions: string;
  improvedTranslation: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:8080/api/evaluation/evaluate';

  constructor(private http: HttpClient) {}

  evaluate(request: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(this.apiUrl, request);
  }
}
