import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KeepAliveService implements OnDestroy {

  private readonly pingUrl = `${environment.apiBaseUrl}/ping`;
  private readonly intervalMs = 45_000; // 45 seconds
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(private http: HttpClient) {}

  /** Call once from AppComponent to start the heartbeat. */
  start(): void {
    if (this.timerId !== null) return; // already running

    // Fire immediately on start, then every 45 s
    this.ping();
    this.timerId = setInterval(() => this.ping(), this.intervalMs);
  }

  private ping(): void {
    this.http.get(this.pingUrl, { responseType: 'text' }).subscribe({
      next: (msg) => console.debug('[KeepAlive] ✅', msg),
      error: (err) => console.warn('[KeepAlive] ⚠️ ping failed', err)
    });
  }

  ngOnDestroy(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
