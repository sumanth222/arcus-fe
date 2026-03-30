import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../services/workout.service';
import { ProfileService } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';
import { ExerciseView, LogSetResponse, SetData, WorkoutExercise } from '../models/workout.model';

// Map exercise names to local videos (extend as needed)
const EXERCISE_VIDEO_MAP: Record<string, string> = {
  'Pushups': '/videos/warmup/pushups.mp4',
  'Lat Pulldown': '/videos/warmup/lat_pulldown.mp4',
  // fallback for unmapped exercises
};

const DEFAULT_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

function buildExerciseView(ex: WorkoutExercise): ExerciseView {
  // Use exerciseTemplateSessionID from backend as exerciseSessionId
  const exerciseSessionId = ex.exerciseTemplateSessionID ?? ex.exerciseSessionId;

  const sets: SetData[] = Array.from({ length: ex.sets }, (_, i) => ({
    setNumber: i + 1,
    targetWeight: ex.targetWeight,
    targetReps: ex.repMax,
    weight: ex.targetWeight,
    reps: ex.repMax,
    completed: false,
    exerciseSessionId
  }));

  // Prefer backend videoUrl, then local map, then default fallback
  const video = ex.videoUrl || EXERCISE_VIDEO_MAP[ex.exerciseName] || DEFAULT_VIDEO;

  return {
    exerciseSessionId,
    name: ex.exerciseName,
    muscle: '',
    video,
    sets,
    tempo: ex.tempo,
    tip: ex.tip ?? ''
  };
}

@Component({
  selector: 'app-workout',
  templateUrl: './workout-component.html',
  styleUrls: ['./workout-component.scss'],
  imports: [CommonModule, FormsModule]
})
export class WorkoutComponent implements OnInit {

  @ViewChild('exerciseVideo') exerciseVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private router: Router,
    private workoutService: WorkoutService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  exercises: ExerciseView[] = [];
  exerciseIndex = 0;
  sessionId: number = 0;
  dayNumber: number = 0;
  totalWeight : number = 0;

  currentSet: SetData | null = null;
  nextSet: SetData | null = null;
  completedSets: SetData[] = [];

  loading = true;
  error = '';
  showTip = false;
  setLogging = false;
  videoLoading = true;

  lastWorkoutDay: number = 1;

  get workout(): ExerciseView {
    return this.exercises[this.exerciseIndex];
  }

  get totalExercises(): number {
    return this.exercises.length;
  }

  get nextExercise(): ExerciseView | null {
    return this.exercises[this.exerciseIndex + 1] ?? null;
  }

  get isBodyweightExercise(): boolean {
    const name = this.workout?.name?.toLowerCase() ?? '';
    return name.includes('push-up') || name.includes('pushup') || name.includes('push up')
        || name.includes('pull-up') || name.includes('pullup') || name.includes('pull up');
  }

  totalVolume(): number {
    return this.completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  }

  totalReps(): number {
    return this.completedSets.reduce((sum, s) => sum + s.reps, 0);
  }

  ngOnInit() {
    // Extract muscleGroups and dayNumber from navigation state if present
    const navState = history.state;
    const passedMuscleGroups = navState?.muscleGroups ?? null;
    const passedDayNumber: number = navState?.nextDayNumber ?? 0;
    this.lastWorkoutDay = navState?.lastWorkoutDay ?? 0;
    console.log('Received navState:', { passedDayNumber, lastWorkoutDay: this.lastWorkoutDay });
    // Restore state from service if returning from rest screen
    if (this.workoutService.activeExercises.length > 0) {
      this.exercises = this.workoutService.activeExercises;
      this.exerciseIndex = this.workoutService.exerciseIndex;
      this.dayNumber = this.workoutService.dayNumber;
      this.loading = false;
      this.restoreSetState();
      return;
    }

    const uid = this.authService.userId;
    if (!uid) { this.router.navigate(['/login']); return; }
    // Fetch the user's level from their profile, then generate the workout
    this.profileService.getUserProfile(uid).subscribe({
      next: (profile) => {
        const level = profile.currentLevel || 'beginner';
        const goal = profile.fitnessGoal || 'muscle_gain';
        const split = profile.workoutSplit || 'bro';
        // Use the dayNumber passed from home (nextDayNumber), not a stale local value
        const dayNumber = passedDayNumber || this.dayNumber || 1;
        const requestedMuscles = passedMuscleGroups;
        this.workoutService.generateCustomWorkout({
          userId: uid,
          level,
          goal,
          split,
          dayNumber,
          lastWorkoutDay: dayNumber,
          requestedMuscles,
        }).subscribe({
          next: (session) => {
            this.sessionId = session.sessionId;
            this.dayNumber = session.dayNumber;
            this.workoutService.dayNumber = session.dayNumber;
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
      },
      error: (err) => {
        this.error = 'Failed to load profile. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  initializeSets() {
    this.completedSets = [];
    this.showTip = false;
    this.videoLoading = true;
    if (!this.workout || !this.workout.sets) {
      console.error('Workout or sets missing:', this.workout, this.exercises);
      this.currentSet = null;
      this.nextSet = null;
      return;
    }
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

    // Show blur + spinner overlay while waiting for backend
    this.setLogging = true;

    // Fire the API call — rest screen will subscribe to the result via service
    this.workoutService.logSet({
      exerciseSessionId: set.exerciseSessionId,
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps
    }).subscribe({
      next: (res) => {
        // If the backend suggests next set weight/reps, update the next set
        if (this.currentSet && res.nextSetWeight != null) {
          this.currentSet.weight = res.nextSetWeight;
        }
        if (this.currentSet && res.nextSetReps != null) {
          this.currentSet.reps = res.nextSetReps;
        }
        this.setLogging = false;
      },
      error: (err) => {
        this.setLogging = false;
        // Optionally handle error
      }
    });

    // Navigate immediately — rest screen picks up the pending observable
    this.router.navigate(['/rest'], {
      state: {
        completedSet: set.setNumber,
        nextSet: this.currentSet,
        exerciseName: this.workout.name
      }
    });
  }

  goToNextExercise() {
    if (this.exerciseIndex + 1 < this.exercises.length) {
      this.exerciseIndex++;
      this.workoutService.exerciseIndex = this.exerciseIndex;
      this.initializeSets();
      // Force video element to reload with the new exercise's src
      setTimeout(() => {
        if (this.exerciseVideo?.nativeElement) {
          this.exerciseVideo.nativeElement.load();
        }
      }, 0);
    } else {
      const totalVolume = this.workoutService.totalSessionVolume;
      const dayNum = this.dayNumber;
      this.workoutService.clearSession();

      // Fire both API calls in parallel, navigate to complete regardless of outcome
      const uid = this.authService.userId;
      if (!uid) { this.router.navigate(['/login']); return; }
      this.profileService.updateLastWorkoutDay(uid, dayNum).subscribe({
        next: () => console.log('Last workout day updated'),
        error: (err) => console.error('Failed to update last workout day', err)
      });

      this.workoutService.completeWorkout(uid, totalVolume).subscribe({
        next: () => console.log('Workout completed, totalWeight:', totalVolume),
        error: (err) => console.error('Failed to complete workout', err)
      });

      this.router.navigate(['/complete'], {
        state: { dayNumber: dayNum, totalVolume: totalVolume }
      });
    }
  }

  completeSet(set: SetData) {
    set.completed = true;
  }

  onVideoLoaded() {
    this.videoLoading = false;
  }

  onVideoError(event: Event) {
    this.videoLoading = false;
    // Fallback to default video on error
    if (this.workout && this.workout.video !== DEFAULT_VIDEO) {
      this.workout.video = DEFAULT_VIDEO;
    }
  }
}