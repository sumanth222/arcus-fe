import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '../models/user-profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

  profile: UserProfile | null = null;
  loading = true;
  errorMessage = '';
  successMessage = '';

  // Edit states
  editingField: string | null = null;
  editValues: { [key: string]: any } = {};

  // Dropdown options — keys must match backend enum values exactly
  levelOptions = [
    { key: 'beginner',     label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced',     label: 'Advanced' },
  ];

  goalOptions = [
    { key: 'muscle_gain',  label: 'Muscle Gain' },
    { key: 'fat_loss',     label: 'Fat Loss' },
    { key: 'strength',     label: 'Strength' },
    { key: 'endurance',    label: 'Endurance' },
    { key: 'maintenance',  label: 'Maintenance' },
  ];

  splitOptions = [
    { key: 'bro_split',    label: 'Bro Split' },
    { key: 'ppl',          label: 'Push / Pull / Legs' },
    { key: 'upper_lower',  label: 'Upper / Lower' },
    { key: 'full_body',    label: 'Full Body' },
    { key: 'mass_gain',    label: 'Mass Gain' },
    { key: 'athletic',     label: 'Athletic' },
  ];

  constructor(
    public router: Router,
    private profileService: ProfileService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const userId = this.authService.userId;
    if (!userId) { this.router.navigate(['/login']); return; }
    this.profileService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  startEdit(field: string) {
    this.editingField = field;
    if (this.profile) {
      this.editValues[field] = this.profile[field as keyof UserProfile];
    }
  }

  cancelEdit() {
    this.editingField = null;
    this.editValues = {};
  }

  saveEdit(field: string) {
    if (!this.profile) return;

    const userId = this.authService.userId;
    if (!userId) { this.router.navigate(['/login']); return; }
    const updatePayload: { [key: string]: any } = {};
    updatePayload[field] = this.editValues[field];

    this.profileService.updateProfile(userId, updatePayload).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.editingField = null;
        this.editValues = {};
        this.successMessage = `${this.getFieldLabel(field)} updated successfully!`;
        setTimeout(() => { this.successMessage = ''; }, 3000);

        // Update display name in session if name was changed
        if (field === 'name') {
          this.authService.setDisplayName(updated.name);
        }
      },
      error: (err) => {
        this.errorMessage = `Failed to update ${field}. Please try again.`;
        console.error('Error updating profile:', err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFieldDisplay(field: string): string {
    if (!this.profile) return '';
    const value = this.profile[field as keyof UserProfile];
    if (field === 'joinedAt' || field === 'lastWorkoutDate') {
      return this.formatDate(value as string);
    }
    return String(value);
  }

  isEditableField(field: string): boolean {
    return ['name', 'email', 'heightCm', 'weightKg', 'currentLevel', 'fitnessGoal', 'workoutSplit'].includes(field);
  }

  getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      heightCm: 'Height',
      weightKg: 'Weight',
      joinedAt: 'Joined',
      currentLevel: 'Experience Level',
      fitnessGoal: 'Fitness Goal',
      workoutSplit: 'Workout Split',
      totalWorkouts: 'Total Workouts',
      totalWeightLifted: 'Total Weight Lifted',
      consecutiveWorkoutDays: 'Consecutive Days',
      lastWorkoutDate: 'Last Workout'
    };
    return labels[field] || field;
  }

  getOptionsList(field: string): { key: string; label: string }[] {
    if (field === 'currentLevel') return this.levelOptions;
    if (field === 'fitnessGoal') return this.goalOptions;
    if (field === 'workoutSplit') return this.splitOptions;
    return [];
  }
}
