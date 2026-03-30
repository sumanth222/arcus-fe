import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProfileService } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-workout-complete',
  templateUrl: './workout-complete-component.html',
  styleUrls: ['./workout-complete-component.scss'],
  imports: [CommonModule]
})
export class WorkoutCompleteComponent {

  totalSets = 15;
  totalWeight = 2670;
  duration = 32;
  dayNumber: number = 0;
  isRestDay: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const state = history.state;
    this.dayNumber = state.dayNumber ?? 0;
    this.totalWeight = state.totalVolume ?? this.totalWeight;
    this.isRestDay = state.isRestDay ?? false;

    // Only call completeDay for actual workouts (rest day calls it from home)
    const userId = this.authService.userId;
    if (userId && this.dayNumber && !this.isRestDay) {
      this.profileService.completeDay(userId, this.dayNumber).subscribe({
        next: () => console.log('Day completed:', this.dayNumber),
        error: (err) => console.error('Failed to complete day', err)
      });
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}