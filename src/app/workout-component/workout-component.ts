import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { ExerciseView, LogSetResponse, SetData, WorkoutExercise } from '../models/workout.model';

// Map exercise names to local videos (extend as needed)
const EXERCISE_VIDEO_MAP: Record<string, string> = {
  'Pushups': '/videos/warmup/pushups.mp4',
  'Lat Pulldown': '/videos/warmup/lat_pulldown.mp4',
  // fallback for unmapped exercises
};

const DEFAULT_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

function buildExerciseView(ex: WorkoutExercise): ExerciseView {
  const sets: SetData[] = Array.from({ length: ex.sets }, (_, i) => ({
    setNumber: i + 1,
    targetWeight: ex.targetWeight,
    targetReps: ex.repMax,
    weight: ex.targetWeight,
    reps: ex.repMax,
    completed: false
  }));

  return {
    exerciseSessionId: ex.exerciseSessionId,
    name: ex.exerciseName,
    muscle: '',
    video: EXERCISE_VIDEO_MAP[ex.exerciseName] ?? DEFAULT_VIDEO,
    sets,
    tempo: ex.tempo
  };
}

@Component({
  selector: 'app-workout',
  templateUrl: './workout-component.html',
  styleUrls: ['./workout-component.scss'],
  imports: [CommonModule, FormsModule]
})
export class WorkoutComponent implements OnInit {

  constructor(private router: Router, private workoutService: WorkoutService) {}

  exercises: ExerciseView[] = [];
  exerciseIndex = 0;
  sessionId: number = 0;

  currentSet: SetData | null = null;
  nextSet: SetData | null = null;
  completedSets: SetData[] = [];

  loading = true;
  error = '';

  get workout(): ExerciseView {
    return this.exercises[this.exerciseIndex];
  }

  get totalExercises(): number {
    return this.exercises.length;
  }

  get nextExercise(): ExerciseView | null {
    return this.exercises[this.exerciseIndex + 1] ?? null;
  }

  totalVolume(): number {
    return this.completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  }

  totalReps(): number {
    return this.completedSets.reduce((sum, s) => sum + s.reps, 0);
  }

  ngOnInit() {
    // Restore state from service if returning from rest screen
    if (this.workoutService.activeExercises.length > 0) {
      this.exercises = this.workoutService.activeExercises;
      this.exerciseIndex = this.workoutService.exerciseIndex;
      this.loading = false;
      this.restoreSetState();
      return;
    }

    this.workoutService.generateWorkout(1, 'beginner').subscribe({
      next: (session) => {
        this.sessionId = session.sessionId;
        this.exercises = session.exercises.map(buildExerciseView);
        this.workoutService.activeExercises = this.exercises;
        this.loading = false;
        this.initializeSets();
      },
      error: (err) => {
        this.error = 'Failed to load workout. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  initializeSets() {
    this.completedSets = [];
    this.currentSet = this.workout.sets[0] ?? null;
    this.nextSet = this.workout.sets[1] ?? null;
  }

  // Restore which set we're on after returning from rest screen
  restoreSetState() {
    const sets = this.workout.sets;
    this.completedSets = sets.filter(s => s.completed);
    const nextPending = sets.find(s => !s.completed);
    this.currentSet = nextPending ?? null;
    const nextIdx = nextPending ? sets.indexOf(nextPending) + 1 : sets.length;
    this.nextSet = sets[nextIdx] ?? null;
  }

  logSet(set: SetData) {
    // Mark set as completed in the stored exercise
    set.completed = true;
    this.completedSets.push({ ...set });

    const nextIndex = set.setNumber; // setNumber is 1-based, gives next 0-based index
    if (nextIndex < this.workout.sets.length) {
      this.currentSet = this.workout.sets[nextIndex];
      this.nextSet = this.workout.sets[nextIndex + 1] ?? null;
    } else {
      this.currentSet = null;
      this.nextSet = null;
    }

    // Persist exercise index in service before navigating
    this.workoutService.exerciseIndex = this.exerciseIndex;

    // Log set to backend and use the response as restData
    this.workoutService.logSet({
      exerciseSessionId: this.workout.exerciseSessionId,
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps
    }).subscribe({
      next: (restData: LogSetResponse) => {
        this.router.navigate(['/rest'], {
          state: {
            restData,
            completedSet: set.setNumber,
            nextSet: this.currentSet
          }
        });
      },
      error: (err) => {
        console.error('Failed to log set', err);
        // Navigate anyway with fallback restData so UX is not blocked
        this.router.navigate(['/rest'], {
          state: {
            restData: {
              fatigueDetected: false,
              suggestedRestSeconds: 60,
              message: 'Good work! Take a short rest.',
              exerciseCompleted: this.currentSet === null
            },
            completedSet: set.setNumber,
            nextSet: this.currentSet
          }
        });
      }
    });
  }

  goToNextExercise() {
    if (this.exerciseIndex + 1 < this.exercises.length) {
      this.exerciseIndex++;
      this.workoutService.exerciseIndex = this.exerciseIndex;
      this.initializeSets();
    } else {
      this.workoutService.clearSession();
      this.router.navigate(['/complete']);
    }
  }

  completeSet(set: SetData) {
    set.completed = true;
  }
}