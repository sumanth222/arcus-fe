import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatRequest {
  message: string;
  context: string;
  exerciseName?: string;
}

export interface ChatResponse {
  reply?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {

  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  ask(message: string, exerciseName?: string): Observable<ChatResponse> {
    const body: ChatRequest = {
      message,
      context: 'You are a helpful fitness assistant for the Arcus fitness app.',
      ...(exerciseName ? { exerciseName } : {})
    };
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat/ask`, body);
  }
}
