import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { LogSetResponse } from '../models/workout.model';

@Component({
  selector: 'app-rest-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rest-screen-component.html',
  styleUrls: ['./rest-screen-component.scss']
})
export class RestScreenComponent implements OnInit, OnDestroy {

  remainingSeconds: number = 0;
  minutes: string = '00';
  seconds: string = '00';
  timer: any;

  restData: LogSetResponse | null = null;
  completedSet!: number;
  nextSet: any;
  exerciseName: string = '';
  loading = true;

  get isBodyweightNextSet(): boolean {
    const name = this.exerciseName.toLowerCase();
    return name.includes('push-up') || name.includes('pushup') || name.includes('push up')
        || name.includes('pull-up') || name.includes('pullup') || name.includes('pull up');
  }

  constructor(private router: Router, private workoutService: WorkoutService) {}

  ngOnInit(): void {
    const state = history.state;
    this.completedSet = state.completedSet;
    this.nextSet = state.nextSet;
    this.exerciseName = state.exerciseName ?? '';

    // Subscribe to the pending API call fired by the workout screen
    const pending$ = this.workoutService.pendingLogSet$;
    if (pending$) {
      pending$.subscribe({
        next: (data: LogSetResponse) => {
          this.restData = data;
          this.loading = false;
          this.remainingSeconds = data.suggestedRestSeconds ?? 60;
          this.updateTimeDisplay();
          this.startTimer();
        },
        error: () => {
          // Fallback if API failed
          this.restData = {
            fatigueDetected: false,
            suggestedRestSeconds: 60,
            message: 'Good work! Take a short rest.',
            exerciseCompleted: !this.nextSet
          };
          this.loading = false;
          this.remainingSeconds = 60;
          this.updateTimeDisplay();
          this.startTimer();
        }
      });
    } else {
      // Fallback if navigated directly
      this.restData = state.restData ?? {
        fatigueDetected: false,
        suggestedRestSeconds: 60,
        message: 'Good work! Take a short rest.',
        exerciseCompleted: false
      };
      this.loading = false;
      this.remainingSeconds = this.restData!.suggestedRestSeconds;
      this.updateTimeDisplay();
      this.startTimer();
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimeDisplay();
      if (this.remainingSeconds <= 0) {
        clearInterval(this.timer);
        this.endRest();
      }
    }, 1000);
  }

  updateTimeDisplay() {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    this.minutes = String(m).padStart(2, '0');
    this.seconds = String(s).padStart(2, '0');
  }

  endRest() {
    clearInterval(this.timer);
    this.router.navigate(['/workout'], {
      state: { completedSet: this.completedSet }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}