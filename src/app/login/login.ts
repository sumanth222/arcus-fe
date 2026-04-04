import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

type Mode = 'login' | 'register';
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'short';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private authService: AuthService) {}

  mode: Mode = 'login';

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;

  loading = false;
  error = '';
  fieldErrors = { password: '', confirm: '', email: '' };

  // Username availability state
  usernameStatus: UsernameStatus = 'idle';
  private usernameInput$ = new Subject<string>();
  private sub!: Subscription;

  get isLogin() { return this.mode === 'login'; }

  ngOnInit() {
    // Debounce username input — fire check 500ms after user stops typing
    this.sub = this.usernameInput$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(val => {
        if (val.length < 3) {
          this.usernameStatus = 'short';
          return [];
        }
        this.usernameStatus = 'checking';
        return this.authService.checkUsername(val);
      })
    ).subscribe({
      next: (res) => {
        this.usernameStatus = res.available ? 'available' : 'taken';
      },
      error: () => {
        this.usernameStatus = 'idle'; // silently ignore check errors
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  switchMode(m: Mode) {
    this.mode = m;
    this.error = '';
    this.fieldErrors = { password: '', confirm: '', email: '' };
    this.usernameStatus = 'idle';
  }

  onUsernameInput() {
    // Only run availability check in register mode
    if (!this.isLogin) {
      this.usernameStatus = this.username.length < 3 ? 'short' : 'checking';
      this.usernameInput$.next(this.username.trim());
    }
  }

  onUsernameBlur() {
    if (!this.isLogin && this.username.trim().length >= 3) {
      // Immediately flush on blur — no need to wait for debounce
      this.usernameInput$.next(this.username.trim());
    }
  }

  validate(): boolean {
    this.fieldErrors = { password: '', confirm: '', email: '' };
    let ok = true;

    if (this.isLogin) {
      // Login: require either username or email
      const hasUsername = this.username.trim().length >= 3;
      const hasEmail = this.email.trim().length > 0 && this.email.includes('@');
      if (!hasUsername && !hasEmail) {
        this.fieldErrors.email = 'Enter your username or email';
        ok = false;
      }
    } else {
      // Register: only username required — email is collected during onboarding
      if (this.username.trim().length < 3) {
        ok = false;
      }
    }

    if (this.password.length < 6) {
      this.fieldErrors.password = 'At least 6 characters';
      ok = false;
    }
    if (!this.isLogin && this.password !== this.confirmPassword) {
      this.fieldErrors.confirm = 'Passwords do not match';
      ok = false;
    }
    // Block register if username is taken or still being checked
    if (!this.isLogin && (this.usernameStatus === 'taken' || this.usernameStatus === 'checking')) {
      ok = false;
    }
    return ok;
  }

  submit() {
    if (!this.validate() || this.loading) return;
    this.loading = true;
    this.error = '';

    const payload = this.isLogin
      ? {
          // If username is filled use it, otherwise use email
          username: this.username.trim() || '',
          email: this.username.trim() ? undefined : this.email.trim(),
          password: this.password
        }
      : { username: this.username.trim(), password: this.password };
    const call$ = this.isLogin
      ? this.authService.login(payload)
      : this.authService.register(payload);

    call$.subscribe({
      next: (res) => {
        console.log('[Auth] response:', res);
        this.loading = false;

        // New user (register flow or flagged by backend) → onboarding
        if (!this.isLogin || res.isNewUser) {
          this.router.navigate(['/onboarding']);
          return;
        }

        // Existing user login — must have a real userId or something is wrong
        if (!res.userId) {
          this.error = 'Login succeeded but no user profile found. Please contact support.';
          return;
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.error = 'Incorrect username or password.';
        } else if (err.status === 409) {
          this.error = 'Username already taken.';
          this.usernameStatus = 'taken';
        } else {
          this.error = 'Something went wrong. Please try again.';
        }
      }
    });
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') this.submit();
  }
}
