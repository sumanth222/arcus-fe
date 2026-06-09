import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';

export interface OnboardingData {
  name: string;
  email: string;
  age: number | null;
  gender: string;
  heightCm: number | null;
  weightKg: number | null;
  currentLevel: string;
  fitnessGoal: string;
  workoutSplit: string;
  workoutLocation: string;
  daysPerWeek: number | null;
  workoutDuration: number | null;
  equipment: string;
  weakMuscleGroups: string;
  injuries: string;
  additionalNotes: string;
}

interface Step {
  id: number;
  title: string;
  subtitle: string;
  section: string;
}

const STEPS: Step[] = [
  { id: 0,  title: "What's your name?",        subtitle: "Let's get to know you",                       section: 'Personal' },
  { id: 1,  title: 'Your email',               subtitle: "We'll keep your progress safe",               section: 'Personal' },
  { id: 2,  title: 'How old are you?',         subtitle: 'Helps us tailor recovery and intensity',      section: 'Personal' },
  { id: 3,  title: 'Your gender',              subtitle: 'Used to personalise your programme',          section: 'Personal' },
  { id: 4,  title: 'Body measurements',        subtitle: 'Used to personalise your nutrition targets',  section: 'Personal' },
  { id: 5,  title: 'Experience level',         subtitle: "Be honest — we'll tailor your plan",          section: 'Fitness' },
  { id: 6,  title: 'Your fitness goal',        subtitle: 'What are you training for?',                  section: 'Fitness' },
  { id: 7,  title: 'Where do you train?',      subtitle: "We'll tailor exercises to your setup",        section: 'Training' },
  { id: 8,  title: 'Choose your split',        subtitle: 'How do you want to structure your week?',     section: 'Training' },
  { id: 9,  title: 'Days per week',            subtitle: 'How many days can you train?',                section: 'Training' },
  { id: 10, title: 'Session duration',         subtitle: 'How long do you have per workout?',           section: 'Training' },
  { id: 11, title: 'Equipment available',      subtitle: "What do you have access to?",                section: 'Training' },
  { id: 12, title: 'Any weak spots?',          subtitle: "Muscles you'd like to prioritise",           section: 'Details' },
  { id: 13, title: 'Injuries or limitations', subtitle: "Anything we should work around",              section: 'Details' },
  { id: 14, title: 'Anything else?',          subtitle: 'Tell your coach anything important',          section: 'Details' },
];@Component({
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
  ) {
    // Pre-fill email from Google sign-in and skip email step
    if (this.authService.googleEmail) {
      this.data.email = this.authService.googleEmail;
    }
  }

  steps = STEPS;
  currentStep = 0;
  animating = false;
  submitting = false;
  error = '';

  get hasGoogleEmail(): boolean { return !!this.authService.googleEmail; }

  data: OnboardingData = {
    name: '', email: '',
    age: null, gender: '',
    heightCm: null, weightKg: null,
    currentLevel: '', fitnessGoal: '',
    workoutSplit: '', workoutLocation: '',
    daysPerWeek: null, workoutDuration: null,
    equipment: '',
    weakMuscleGroups: '', injuries: '', additionalNotes: ''
  };

  genders = [
    { key: 'male',        label: 'Male',              icon: '♂️' },
    { key: 'female',      label: 'Female',            icon: '♀️' },
    { key: 'non_binary',  label: 'Non-binary',        icon: '⚧️' },
    { key: 'prefer_not',  label: 'Prefer not to say', icon: '—'  },
  ];

  levels = [
    { key: 'beginner',     label: 'Beginner',     icon: '🌱', desc: 'New to structured training' },
    { key: 'intermediate', label: 'Intermediate', icon: '⚡', desc: '1–3 years of consistent lifting' },
    { key: 'advanced',     label: 'Advanced',     icon: '🔥', desc: '3+ years, chasing peak performance' },
  ];

  goals = [
    { key: 'muscle_gain',     label: 'Muscle Gain',    icon: '💪', desc: 'Build size and strength' },
    { key: 'fat_loss',        label: 'Fat Loss',        icon: '🔥', desc: 'Lean out and cut body fat' },
    { key: 'strength',        label: 'Strength',        icon: '🏋️', desc: 'Lift heavier, get stronger' },
    { key: 'general_fitness', label: 'General Fitness', icon: '🎯', desc: 'Stay active, feel better' },
  ];

  locations = [
    { key: 'gym',  label: 'Gym',  icon: '🏋️', desc: 'Full equipment available' },
    { key: 'home', label: 'Home', icon: '🏠', desc: 'Bodyweight & minimal equipment' },
    { key: 'both', label: 'Both', icon: '🔀', desc: 'Mix of gym and home sessions' },
  ];

  splits = [
    { key: 'ppl',         label: 'Push/Pull/Legs', icon: '🔄', desc: 'Efficient 6-day powerhouse split' },
    { key: 'upper_lower', label: 'Upper / Lower',  icon: '↕️', desc: '4-day balanced split' },
    { key: 'full_body',   label: 'Full Body',      icon: '🌐', desc: '3-day compound-focused training' },
    { key: 'bro_split',   label: 'Bro Split',      icon: '🤜', desc: 'One muscle group per day' },
    { key: 'mass_gain',   label: 'Mass Gain',      icon: '🏆', desc: 'High volume hypertrophy protocol' },
    { key: 'athletic',    label: 'Athletic',       icon: '⚡', desc: 'Power, speed and explosiveness' },
  ];

  daysOptions = [3, 4, 5, 6];

  durationOptions = [
    { value: 30, label: '30 min', desc: 'Quick & efficient' },
    { value: 45, label: '45 min', desc: 'The sweet spot' },
    { value: 60, label: '60 min', desc: 'Full session' },
    { value: 90, label: '90 min', desc: 'Maximum effort' },
  ];

  equipmentOptions = [
    { key: 'full_gym',   label: 'Full gym',         icon: '🏋️', desc: 'Barbells, cables, machines' },
    { key: 'dumbbells',  label: 'Dumbbells only',   icon: '💪', desc: 'Home dumbbells setup' },
    { key: 'bodyweight', label: 'Bodyweight',       icon: '🧘', desc: 'No equipment needed' },
    { key: 'resistance', label: 'Resistance bands', icon: '🪢', desc: 'Bands & bodyweight' },
  ];

  get step(): Step { return this.steps[this.currentStep]; }

  get username(): string { return this.authService.username; }

  get progressPct(): number {
    return (this.currentStep / this.steps.length) * 100;
  }

  get sectionSteps(): Step[] {
    return this.steps.filter(s => s.section === this.step.section);
  }

  get stepInSection(): number {
    return this.sectionSteps.findIndex(s => s.id === this.step.id) + 1;
  }

  get canAdvance(): boolean {
    switch (this.currentStep) {
      case 0:  return this.data.name.trim().length >= 2;
      case 1:  return this.hasGoogleEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.data.email);
      case 2:  return this.data.age != null && this.data.age >= 13 && this.data.age <= 100;
      case 3:  return !!this.data.gender;
      case 4:  return (this.data.heightCm != null && this.data.heightCm > 0)
                   && (this.data.weightKg != null && this.data.weightKg > 0);
      case 5:  return !!this.data.currentLevel;
      case 6:  return !!this.data.fitnessGoal;
      case 7:  return !!this.data.workoutLocation;
      case 8:  return !!this.data.workoutSplit;
      case 9:  return this.data.daysPerWeek != null;
      case 10: return this.data.workoutDuration != null;
      case 11: return !!this.data.equipment;
      case 12: return true;
      case 13: return true;
      case 14: return true;
      default: return false;
    }
  }

  next() {
    if (!this.canAdvance || this.animating) return;
    if (this.currentStep === this.steps.length - 1) { this.submit(); return; }
    this.animating = true;
    setTimeout(() => {
      this.currentStep++;
      if (this.currentStep === 1 && this.hasGoogleEmail) this.currentStep++;
      this.animating = false;
    }, 220);
  }

  back() {
    if (this.currentStep === 0 || this.animating) return;
    this.animating = true;
    setTimeout(() => {
      this.currentStep--;
      if (this.currentStep === 1 && this.hasGoogleEmail) this.currentStep--;
      this.animating = false;
    }, 220);
  }

  select(field: keyof OnboardingData, value: any) {
    (this.data as any)[field] = value;
  }

  startOver() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  submit() {
    this.submitting = true;
    this.error = '';

    if (!this.authService.username) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.profileService.createProfile({
      username: this.authService.username,
      name: this.data.name.trim(),
      email: this.data.email.trim(),
      age: this.data.age,
      gender: this.data.gender,
      heightCm: this.data.heightCm,
      weightKg: this.data.weightKg,
      currentLevel: this.data.currentLevel,
      fitnessGoal: this.data.fitnessGoal,
      workoutSplit: this.data.workoutSplit,
      workoutLocation: this.data.workoutLocation,
      daysPerWeek: this.data.daysPerWeek,
      workoutDuration: this.data.workoutDuration,
      equipment: this.data.equipment,
      weakMuscleGroups: this.data.weakMuscleGroups.trim() || null,
      injuries: this.data.injuries.trim() || null,
      additionalNotes: this.data.additionalNotes.trim() || null,
      lastWorkoutDay: 0
    }).subscribe({
      next: (profile) => {
        this.authService.setUserSession(profile.userId, profile.name, profile.status ?? 'PENDING_REVIEW');
        this.router.navigate(['/assessment-review']);
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
