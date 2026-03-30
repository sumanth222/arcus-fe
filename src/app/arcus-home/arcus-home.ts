import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';
import { WorkoutService } from '../services/workout.service';

@Component({
  selector: 'app-arcus-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arcus-home.html',
  styleUrls: ['./arcus-home.scss']
})
export class ArcusHomeComponent implements OnInit {

  @ViewChild('sliderThumb') sliderThumb!: ElementRef;
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;

  constructor(
    public router: Router,
    private profileService: ProfileService,
    private authService: AuthService,
    private workoutService: WorkoutService
  ) {}

  get userName(): string { return this.authService.userName || 'Athlete'; }
  get isRestDay(): boolean { return this.todaysWorkout.name?.toLowerCase() === 'rest'; }

  dragging = false;
  startX = 0;
  currentX = 0;

  todaysWorkout = { name: 'Loading...', muscles: '', muscleGroups: [] as string[] };
  lastWorkout    = { name: '—', volume: 0, date: '' };
  nextMuscleGroups: string[] = [];
  lastDay: number = 1;
  currentDayNum: number = 1;
  percentageChange: number = 0.0;

  ngOnInit() {
    const userId = this.authService.userId;
    if (!userId) { this.router.navigate(['/login']); return; }
    this.profileService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.lastDay = profile.lastWorkoutDay;
        console.log("Last wd: ", this.lastDay)
        this.profileService.getNextWorkoutInfo(userId, profile.currentLevel || 'beginner').subscribe({
          next: (info) => {
            this.currentDayNum = info.nextDayNumber;
            this.todaysWorkout = {
              name: info.nextWorkoutName,
              muscles: `Day ${info.nextDayNumber}`,
              muscleGroups: info.muscleGroups || []
            };
            this.nextMuscleGroups = info.muscleGroups || [];
            this.lastWorkout = {
              name: info.lastWorkoutName,
              volume: info.lastWorkoutTotalWeight,
              date: info.lastWorkoutDate
                ? new Date(info.lastWorkoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : ''
            };
            this.percentageChange = info.lastWorkoutWeightChangePercent;
          },
          error: () => {
            this.todaysWorkout = { name: 'Push Day', muscles: 'Day 1', muscleGroups: [] };
            this.nextMuscleGroups = [];
          }
        });
      },
      error: () => {
        this.todaysWorkout = { name: 'Push Day', muscles: 'Day 1', muscleGroups: [] };
        this.nextMuscleGroups = [];
      }
    });
  }

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.dragging = true;
    this.startX = this.getPosition(event);
  }

  onDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (!this.dragging) return;

    const containerWidth =
      this.sliderContainer.nativeElement.offsetWidth - 60;

    const moveX = this.getPosition(event) - this.startX;

    this.currentX = Math.max(0, Math.min(moveX, containerWidth));

    this.sliderThumb.nativeElement.style.transform =
      `translateX(${this.currentX}px)`;
  }

  endDrag(event?: MouseEvent | TouchEvent) {
    if (event) event.preventDefault();
    this.dragging = false;

    const containerWidth =
      this.sliderContainer.nativeElement.offsetWidth - 60;

    if (this.currentX > containerWidth * 0.8) {
      this.startWorkout();
    }

    this.sliderThumb.nativeElement.style.transform = `translateX(0px)`;
    this.currentX = 0;
  }

  startWorkout() {
    if (this.isRestDay) {
      const userId = this.authService.userId;
      if (userId) {
        // Register the rest day completion and log it as a 0-weight workout
        this.profileService.completeDay(userId, this.currentDayNum).subscribe();
        this.workoutService.completeWorkout(userId, 0).subscribe();
        this.router.navigate(['/complete'], { state: { isRestDay: true } });
      }
      return;
    }
    this.router.navigate(['/warmup'], { state: { muscleGroups: this.nextMuscleGroups, lastWorkoutDay: this.lastDay, nextDayNumber: this.currentDayNum } });
  }

  loadData(userId: number) {
    this.todaysWorkout = { name: 'Loading...', muscles: '', muscleGroups: [] };
    this.profileService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.lastDay = profile.lastWorkoutDay;
        this.profileService.getNextWorkoutInfo(userId, profile.currentLevel || 'beginner').subscribe({
          next: (info) => {
            this.todaysWorkout = {
              name: info.nextWorkoutName,
              muscles: `Day ${info.nextDayNumber}`,
              muscleGroups: info.muscleGroups || []
            };
            this.nextMuscleGroups = info.muscleGroups || [];
            this.lastWorkout = {
              name: info.lastWorkoutName,
              volume: info.lastWorkoutTotalWeight,
              date: info.lastWorkoutDate
                ? new Date(info.lastWorkoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : ''
            };
          },
          error: () => {
            this.todaysWorkout = { name: 'Push Day', muscles: 'Day 1', muscleGroups: [] };
            this.nextMuscleGroups = [];
          }
        });
      },
      error: () => {
        this.todaysWorkout = { name: 'Push Day', muscles: 'Day 1', muscleGroups: [] };
        this.nextMuscleGroups = [];
      }
    });
  }

  getPosition(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent
      ? event.clientX
      : event.touches[0].clientX;
  }
}