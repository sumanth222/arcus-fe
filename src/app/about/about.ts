import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class AboutComponent {

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  get isLoggedIn(): boolean {
    return !!this.authService.userId;
  }

  goBack() {
    if (this.isLoggedIn) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  features = [
    {
      icon: '🧠',
      title: 'AI-Driven Workouts',
      desc: 'Adaptive programs generated fresh each session — calibrated to your level, goal, and split.'
    },
    {
      icon: '📈',
      title: 'Progressive Overload',
      desc: 'The backend tracks every set and automatically suggests the right weight and reps next time.'
    },
    {
      icon: '🥗',
      title: 'Nutrition Lite',
      desc: 'Protein targets, calorie ranges, and post-workout meal ideas — all synced to your fitness goal.'
    },
    {
      icon: '🔥',
      title: 'Streak Tracking',
      desc: 'Consecutive workout days, total volume, and per-session comparisons keep you accountable.'
    },
    {
      icon: '⚡',
      title: 'Six Training Splits',
      desc: 'Bro Split, PPL, Upper/Lower, Full Body, Mass Gain, Athletic — your week, your way.'
    },
    {
      icon: '🎯',
      title: 'Smart Rest Days',
      desc: 'Scheduled recovery is part of the plan. Arcus logs rest days and keeps your streak intact.'
    },
  ];

  stats = [
    { value: '6',    label: 'Training Splits' },
    { value: '50+',  label: 'Exercises' },
    { value: '100%', label: 'Free' },
  ];

  benefits = [
    {
      emoji: '⏱️',
      title: 'Save Time',
      desc: 'No more guessing. Workouts are generated instantly based on your goals and history.'
    },
    {
      emoji: '📊',
      title: 'Track Progress',
      desc: 'Every set, rep, and weight is logged. See week-over-week improvements at a glance.'
    },
    {
      emoji: '🎯',
      title: 'Stay Consistent',
      desc: 'Streak tracking and scheduled rest days keep you accountable without burnout.'
    },
  ];
}
