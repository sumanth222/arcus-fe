import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/user-profile';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:8080/auth';

  private _userId: number | null = null;
  private _userName: string = '';
  private _username: string = '';

  constructor(private http: HttpClient) {
    const stored = sessionStorage.getItem('arcus_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this._userId   = parsed.userId != null ? Number(parsed.userId) : null;
        this._userName = parsed.name    ?? '';
        this._username = parsed.username ?? '';
        console.log('[AuthService] restored session:', { userId: this._userId, name: this._userName, username: this._username });
      } catch {
        sessionStorage.removeItem('arcus_user');
      }
    }
  }

  get userId(): number | null { return this._userId; }
  get userName(): string      { return this._userName; }
  get username(): string      { return this._username; }
  get isLoggedIn(): boolean   { return this._userId !== null; }

  /** GET /auth/check-username?username=foo → { available: boolean } */
  checkUsername(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(
      `${this.baseUrl}/check-username?username=${encodeURIComponent(username)}`
    );
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => this.storeSession(res.userId, res.name, payload.username))
    );
  }

  register(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap(res => this.storeSession(res.userId, res.name, payload.username))
    );
  }

  private storeSession(userId: number | null, name: string, username: string) {
    this._userId   = userId != null ? Number(userId) : null;
    this._userName = name;
    this._username = username;
    const payload = { userId: this._userId, name, username };
    console.log('[AuthService] storeSession:', payload);
    sessionStorage.setItem('arcus_user', JSON.stringify(payload));
  }

  setDisplayName(name: string) {
    this._userName = name;
    const stored = sessionStorage.getItem('arcus_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      sessionStorage.setItem('arcus_user', JSON.stringify({ ...parsed, name }));
    }
  }

  setUserSession(userId: number, name: string) {
    this.storeSession(Number(userId), name, this._username);
  }

  logout() {
    this._userId   = null;
    this._userName = '';
    this._username = '';
    sessionStorage.removeItem('arcus_user');
  }
}
