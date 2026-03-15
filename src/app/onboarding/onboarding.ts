import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';

export interface OnboardingData {
  name: string;
  email: string;
  currentLevel: string;
  fitnessGoal: string;
  workoutSplit: string;
}

interface Step {
  id: number;
  title: string;
  subtitle: string;
}

const STEPS: Step[] = [
  { id: 0, title: "What's your name?",        subtitle: "Let's get to know you" },
  { id: 1, title: 'Your email',               subtitle: 'We\'ll keep your progress safe' },
  { id: 2, title: 'Experience level',         subtitle: 'Be honest — we\'ll tailor your plan' },
  { id: 3, title: 'Your fitness goal',        subtitle: 'What are you training for?' },
  { id: 4, title: 'Choose your split',        subtitle: 'How do you want to structure your week?' },
];

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.scss']
})
export class OnboardingComponent {

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  steps = STEPS;
  currentStep = 0;
  animating = false;
  submitting = false;
  error = '';

  data: OnboardingData = {
    name: '',
    email: '',
    currentLevel: '',
    fitnessGoal: '',
    workoutSplit: ''
  };

  levels = [
    { key: 'beginner',     label: 'Beginner',      icon: '🌱', desc: 'New to structured training' },
    { key: 'intermediate', label: 'Intermediate',   icon: '⚡', desc: '1–3 years of consistent lifting' },
    { key: 'advanced',     label: 'Advanced',       icon: '🔥', desc: '3+ years, chasing peak performance' },
  ];

  goals = [
    { key: 'muscle_gain',    label: 'Muscle Gain',     icon: '💪', desc: 'Build size and strength' },
    { key: 'fat_loss',       label: 'Fat Loss',         icon: '🔥', desc: 'Lean out and cut body fat' },
    { key: 'strength',       label: 'Strength',         icon: '🏋️', desc: 'Lift heavier, get stronger' },
    { key: 'endurance',      label: 'Endurance',        icon: '🏃', desc: 'Improve stamina and cardio' },
    { key: 'maintenance',    label: 'Maintenance',      icon: '⚖️', desc: 'Stay fit, stay consistent' },
  ];

  splits = [
    { key: 'bro_split',      label: 'Bro Split',        icon: '🤜', desc: 'One muscle group per day — classic' },
    { key: 'ppl',            label: 'Push/Pull/Legs',   icon: '🔄', desc: 'Efficient 6-day powerhouse split' },
    { key: 'upper_lower',    label: 'Upper / Lower',    icon: '↕️', desc: '4-day balanced split' },
    { key: 'full_body',      label: 'Full Body',        icon: '🌐', desc: '3-day compound-focused training' },
    { key: 'mass_gain',      label: 'Mass Gain',        icon: '🏆', desc: 'High volume hypertrophy protocol' },
    { key: 'athletic',       label: 'Athletic',         icon: '⚡', desc: 'Power, speed and explosiveness' },
  ];

  get step(): Step { return this.steps[this.currentStep]; }

  // Expose the raw login username so the template can show "@handle"
  get username(): string { return this.authService.username; }

  get progressPct(): number {
    return ((this.currentStep) / (this.steps.length)) * 100;
  }

  get canAdvance(): boolean {
    switch (this.currentStep) {
      case 0: return this.data.name.trim().length >= 2;
      case 1: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.data.email);
      case 2: return !!this.data.currentLevel;
      case 3: return !!this.data.fitnessGoal;
      case 4: return !!this.data.workoutSplit;
      default: return false;
    }
  }

  next() {
    if (!this.canAdvance || this.animating) return;
    if (this.currentStep === this.steps.length - 1) {
      this.submit();
      return;
    }
    this.animating = true;
    setTimeout(() => {
      this.currentStep++;
      this.animating = false;
    }, 220);
  }

  back() {
    if (this.currentStep === 0 || this.animating) return;
    this.animating = true;
    setTimeout(() => {
      this.currentStep--;
      this.animating = false;
    }, 220);
  }

  select(field: keyof OnboardingData, value: string) {
    this.data[field] = value;
  }

  // Let the user go back to login to change their username
  startOver() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  submit() {
    this.submitting = true;
    this.error = '';

    // Safety guard: if username was lost (page refresh etc.) send back to login
    if (!this.authService.username) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.profileService.createProfile({
      username: this.authService.username,   // raw login handle — backend uses this to find credentials & link the profile
      name: this.data.name.trim(),
      email: this.data.email.trim(),
      currentLevel: this.data.currentLevel,
      fitnessGoal: this.data.fitnessGoal,
      workoutSplit: this.data.workoutSplit,
      lastWorkoutDay: 0
    }).subscribe({
      next: (profile) => {
        // Store the real userId + display name now that the profile is created
        this.authService.setUserSession(profile.userId, profile.name);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Something went wrong. Please try again.';
        this.submitting = false;
      }
    });
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') this.next();
  }
}
