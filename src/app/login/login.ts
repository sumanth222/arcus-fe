import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Google client ID — replace with your actual OAuth client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = '1056291595970-0aacmrca1ueithg72rpmkr9h5h2j4s8e.apps.googleusercontent.com';

type Mode = 'login' | 'register';
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'short';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private authService: AuthService, private route: ActivatedRoute, private ngZone: NgZone) {}

  mode: Mode = 'login';

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;

  loading = false;
  googleLoading = false;
  error = '';
  fieldErrors = { password: '', confirm: '', email: '' };

  // Username availability state
  usernameStatus: UsernameStatus = 'idle';
  private usernameInput$ = new Subject<string>();
  private sub!: Subscription;

  get isLogin() { return this.mode === 'login'; }

  ngOnInit() {
    // Auto-switch tab based on ?mode=register|login from splash CTAs
    const modeParam = this.route.snapshot.queryParamMap.get('mode');
    if (modeParam === 'register' || modeParam === 'login') {
      this.mode = modeParam;
    }

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

  // ── Google Sign-In ────────────────────────────────────────────

  /** Triggered by our custom button — uses OAuth popup redirect flow */
  signInWithGoogle() {
    if (typeof google === 'undefined') {
      this.error = 'Google Sign-In is not available. Please try again.';
      return;
    }
    // Use token client popup — more reliable than One Tap for localhost
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          this.ngZone.run(() => {
            this.error = 'Google sign-in failed. Please try again.';
          });
          return;
        }
        // Exchange access token for ID token via userinfo
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
          .then(r => r.json())
          .then((userInfo: any) => {
            this.ngZone.run(() => this.handleGoogleCallback(tokenResponse.access_token, userInfo));
          })
          .catch(() => {
            this.ngZone.run(() => { this.error = 'Google sign-in failed. Please try again.'; });
          });
      },
    });
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  }

  /** Called after OAuth popup succeeds */
  private handleGoogleCallback(accessToken: string, userInfo?: any) {
    this.googleLoading = true;
    this.error = '';
    this.authService.googleLogin(accessToken, userInfo).subscribe({
      next: (res) => {
        this.googleLoading = false;
        if (res.isNewUser) {
          this.router.navigate(['/onboarding']);
        } else if (res.userId) {
          this.router.navigate(['/home']);
        } else {
          this.error = 'Google sign-in succeeded but no profile found.';
        }
      },
      error: () => {
        this.googleLoading = false;
        this.error = 'Google sign-in failed. Please try again or use email/password.';
      }
    });
  }
}
