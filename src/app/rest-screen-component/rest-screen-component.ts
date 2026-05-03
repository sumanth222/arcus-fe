import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { LogSetResponse, SetRPE } from '../models/workout.model';

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
  private autoFireTimer: any;

  restData: LogSetResponse | null = null;
  completedSet!: number;
  nextSet: any;
  exerciseName: string = '';

  // Phase 1: waiting for RPE pick. Phase 2: loading API. Phase 3: resting.
  phase: 'rpe' | 'loading' | 'resting' = 'rpe';

  // Countdown shown during RPE phase (auto-fires after N seconds)
  rpeCountdown = 5;

  selectedRpe: SetRPE = null;

  readonly rpeOptions: { key: SetRPE; emoji: string; label: string }[] = [
    { key: 'easy',     emoji: '😌', label: 'Easy' },
    { key: 'moderate', emoji: '😐', label: 'Moderate' },
    { key: 'hard',     emoji: '😤', label: 'Hard' },
    { key: 'failed',   emoji: '💀', label: 'Failed' },
  ];

  get isBodyweightNextSet(): boolean {
    const name = this.exerciseName.toLowerCase();
    return name.includes('push-up') || name.includes('pushup') || name.includes('push up')
        || name.includes('pull-up') || name.includes('pullup') || name.includes('pull up')
        || name.includes('dip') || name.includes('chin-up') || name.includes('chinup') || name.includes('chin up')
        || name.includes('muscle-up') || name.includes('muscleup') || name.includes('muscle up')
        || name.includes('handstand') || name.includes('pistol squat') || name.includes('pistol')
        || name.includes('planche') || name.includes('l-sit') || name.includes('l sit')
        || name.includes('burpee') || name.includes('jump squat') || name.includes('lunge')
        || name.includes('bodyweight') || name.includes('bw');
  }

  get loading(): boolean { return this.phase === 'loading'; }

  constructor(private router: Router, private workoutService: WorkoutService) {}

  ngOnInit(): void {
    const state = history.state;
    this.completedSet = state.completedSet;
    this.nextSet = state.nextSet;
    this.exerciseName = state.exerciseName ?? '';

    if (this.workoutService.pendingLogSetPayload) {
      // Phase 1: show RPE selector, auto-fire after 5s if nothing selected
      this.phase = 'rpe';
      this.startRpeCountdown();
    } else {
      // No staged payload (e.g. direct navigation) — skip to resting with defaults
      this.restData = state.restData ?? {
        fatigueDetected: false, suggestedRestSeconds: 60,
        message: 'Good work! Take a short rest.', exerciseCompleted: false
      };
      this.phase = 'resting';
      this.remainingSeconds = this.restData!.suggestedRestSeconds;
      this.updateTimeDisplay();
      this.startTimer();
    }
  }

  /** Ticking countdown during RPE phase — auto-fires when it hits 0 */
  private startRpeCountdown() {
    this.rpeCountdown = 5;
    this.autoFireTimer = setInterval(() => {
      this.rpeCountdown--;
      if (this.rpeCountdown <= 0) {
        clearInterval(this.autoFireTimer);
        this.fireApi();
      }
    }, 1000);
  }

  selectRpe(rpe: SetRPE) {
    this.selectedRpe = this.selectedRpe === rpe ? null : rpe;
    // User picked — clear countdown and fire immediately
    clearInterval(this.autoFireTimer);
    this.fireApi();
  }

  private fireApi() {
    this.workoutService.pendingRpe = this.selectedRpe;
    this.phase = 'loading';

    this.workoutService.fireLogSet().subscribe({
      next: (data: LogSetResponse) => {
        this.restData = data;
        this.phase = 'resting';
        this.remainingSeconds = data.suggestedRestSeconds ?? 60;
        this.updateTimeDisplay();
        this.startTimer();

        // ── Write updated weight/reps back into the active exercise sets ──
        // so when workout screen restores state it shows the backend-suggested values
        const exercises = this.workoutService.activeExercises;
        const exIndex = this.workoutService.exerciseIndex;
        const exercise = exercises[exIndex];
        if (exercise) {
          const nextSetIndex = exercise.sets.findIndex(s => !s.completed);
          if (nextSetIndex !== -1) {
            if (data.nextSetWeight != null) {
              exercise.sets[nextSetIndex].weight = data.nextSetWeight;
              exercise.sets[nextSetIndex].targetWeight = data.nextSetWeight;
            }
            if (data.nextSetReps != null) {
              exercise.sets[nextSetIndex].reps = data.nextSetReps;
              exercise.sets[nextSetIndex].targetReps = data.nextSetReps;
            }
          }
        }
      },
      error: () => {
        this.restData = {
          fatigueDetected: false, suggestedRestSeconds: 60,
          message: 'Good work! Take a short rest.', exerciseCompleted: !this.nextSet
        };
        this.phase = 'resting';
        this.remainingSeconds = 60;
        this.updateTimeDisplay();
        this.startTimer();
      }
    });
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
    clearInterval(this.autoFireTimer);
    this.router.navigate(['/workout'], {
      state: { completedSet: this.completedSet }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    clearInterval(this.autoFireTimer);
  }
}