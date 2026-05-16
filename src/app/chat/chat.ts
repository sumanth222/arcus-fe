import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  error?: boolean;
}

// ── Rate-limit config ────────────────────────────────────────────
const COOLDOWN_SECONDS  = 30;  // mandatory gap between sends
const MAX_PER_MINUTE    = 8;   // hard cap on messages per 60-second window
const WINDOW_MS         = 60_000;
// ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('messageList') messageList!: ElementRef<HTMLDivElement>;
  @ViewChild('inputField')  inputField!:  ElementRef<HTMLTextAreaElement>;

  messages: ChatMessage[] = [];
  inputText    = '';
  loading      = false;
  exerciseName = '';

  // Rate-limit state
  cooldownRemaining = 0;          // seconds until next send allowed
  messagesThisWindow = 0;         // sends in the current 60-s window
  rateLimitHit = false;           // true when the per-minute cap is reached

  private shouldScrollToBottom = false;
  private cooldownTimer: any     = null;
  private windowResetTimer: any  = null;
  private messageTimes: number[] = [];  // timestamps of recent sends

  constructor(private router: Router, private chatService: ChatService) {}

  // ── Computed helpers for template ──────────────────────────────
  get isSendBlocked(): boolean {
    return this.loading || this.cooldownRemaining > 0 || this.rateLimitHit;
  }

  get sendBtnDisabled(): boolean {
    return !this.inputText.trim() || this.isSendBlocked;
  }

  get rateLimitLabel(): string | null {
    if (this.rateLimitHit)        return `Slow down — limit reached. Try again in a moment.`;
    if (this.cooldownRemaining > 0) return `Next message in ${this.cooldownRemaining}s`;
    return null;
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    const state = history.state;
    this.exerciseName = state?.exerciseName ?? '';

    const welcome = this.exerciseName
      ? `Hey! I'm your Arcus AI coach 💪 Ask me anything about **${this.exerciseName}** — form tips, alternatives, how many sets… whatever you need.`
      : "Hey! I'm your Arcus AI coach 💪 Ask me anything about your workouts, nutrition, or recovery.";

    this.messages.push({ role: 'ai', text: welcome, timestamp: new Date() });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.cooldownTimer);
    clearTimeout(this.windowResetTimer);
  }

  // ── Rate-limit logic ──────────────────────────────────────────
  private recordSend(): boolean {
    const now = Date.now();

    // Prune timestamps older than the window
    this.messageTimes = this.messageTimes.filter(t => now - t < WINDOW_MS);

    if (this.messageTimes.length >= MAX_PER_MINUTE) {
      this.rateLimitHit = true;
      // Calculate how long until the oldest message falls out of the window
      const oldestAge  = now - this.messageTimes[0];
      const waitMs     = WINDOW_MS - oldestAge + 500;
      clearTimeout(this.windowResetTimer);
      this.windowResetTimer = setTimeout(() => {
        this.rateLimitHit = false;
        this.messageTimes = this.messageTimes.filter(t => Date.now() - t < WINDOW_MS);
      }, waitMs);
      return false;  // blocked
    }

    this.messageTimes.push(now);
    this.messagesThisWindow = this.messageTimes.length;

    // Start cooldown countdown
    this.cooldownRemaining = COOLDOWN_SECONDS;
    clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.cooldownRemaining--;
      if (this.cooldownRemaining <= 0) {
        this.cooldownRemaining = 0;
        clearInterval(this.cooldownTimer);
      }
    }, 1000);

    return true;  // allowed
  }

  // ── Send ──────────────────────────────────────────────────────
  send() {
    const text = this.inputText.trim();
    if (!text || this.isSendBlocked) return;

    if (!this.recordSend()) {
      // Rate limit hit — show a system message once
      this.messages.push({
        role: 'ai',
        text: `⏳ You've sent ${MAX_PER_MINUTE} messages in the last minute. Give me a moment to catch up!`,
        timestamp: new Date(),
        error: true
      });
      this.shouldScrollToBottom = true;
      return;
    }

    this.messages.push({ role: 'user', text, timestamp: new Date() });
    this.inputText = '';
    this.loading = true;
    this.shouldScrollToBottom = true;

    this.chatService.ask(text, this.exerciseName || undefined).subscribe({
      next: (res) => {
        if (res.error) {
          this.messages.push({ role: 'ai', text: res.error, timestamp: new Date(), error: true });
        } else {
          this.messages.push({ role: 'ai', text: res.reply ?? '…', timestamp: new Date() });
        }
        this.loading = false;
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.messages.push({
          role: 'ai',
          text: 'Something went wrong. Please try again.',
          timestamp: new Date(),
          error: true
        });
        this.loading = false;
        this.shouldScrollToBottom = true;
      }
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  goBack() {
    if (this.exerciseName) {
      this.router.navigate(['/workout']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    try {
      const el = this.messageList.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
