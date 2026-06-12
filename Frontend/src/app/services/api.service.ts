// services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, AddConvoResponse, FlagPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getContexts(): Observable<Conversation[]> {
    return this.http.post<Conversation[]>(`${this.base}/contexts`, {});
  }

  addConversation(context: string): Observable<AddConvoResponse> {
    return this.http.post<AddConvoResponse>(`${this.base}/add`, { context });
  }

  getConversation(convo_id: string): Observable<{ qa: any[] }> {
    return this.http.post<{ qa: any[] }>(`${this.base}/convo`, { convo_id });
  }

  sendQuestion(id: string, question: string): Observable<string> {
    return this.http.post<string>(`${this.base}/question`, { id, question });
  }

  flagAnswer(payload: FlagPayload): Observable<any> {
    return this.http.post(`${this.base}/flag`, payload);
  }
}
