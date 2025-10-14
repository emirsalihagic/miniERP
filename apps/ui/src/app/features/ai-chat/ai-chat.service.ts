import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  conversationId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    toolData?: any;
  }>;
  toolData?: any;
  proposedAction?: {
    action: string;
    args: any;
    summary: string;
  };
}

export interface ExecuteRequest {
  action: string;
  args: any;
  conversationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  chat(message: string, conversationId?: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, { 
      message, 
      conversationId 
    });
  }

  execute(action: string, args: any, conversationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/execute`, { 
      action, 
      args, 
      conversationId 
    });
  }
}
