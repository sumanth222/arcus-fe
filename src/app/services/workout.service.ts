import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, ReplaySubject } from 'rxjs';
import { ExerciseView, LogSetResponse, WorkoutSession } from '../models/workout.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {

  private baseUrl = 'http://localhost:8080';

  // In-memory session state — persists across navigation
  activeSession: WorkoutSession | null = null;
  activeExercises: ExerciseView[] = [];
  exerciseIndex: number = 0;
  dayNumber: number = 0;

  // Holds the pending log-set response for the rest screen to consume
  pendingLogSet$: ReplaySubject<LogSetResponse> | null = null;

  // Accumulates total volume (weight × reps) across all logged sets in the session
  totalSessionVolume: number = 0;

  constructor(private http: HttpClient) {}

  generateWorkout(userId: number, level: string, goal: string): Observable<WorkoutSession> {
    if (this.activeSession) {
      return of(this.activeSession);
    }
    return this.http.get<WorkoutSession>(
      `${this.baseUrl}/workout/generateWorkout?userId=${userId}&level=${level}&goal=${goal}`
    ).pipe(
      tap(session => this.activeSession = session)
    );
  }

  generateCustomWorkout(payload: {
    userId: number;
    level: string;
    goal: string;
    split: string;
    dayNumber: number;
    lastWorkoutDay: number;
    requestedMuscles: Array<{ muscleGroup: string; areasOrder: string[]; count: number }>;
  }): Observable<WorkoutSession> {
    return this.http.post<WorkoutSession>(
      `${this.baseUrl}/workout/generateCustom`,
      payload
    ).pipe(
      tap(session => this.activeSession = session)
    );
  }

  logSet(payload: { exerciseSessionId: number; setNumber: number; weight: number; reps: number }): ReplaySubject<LogSetResponse> {
    // Accumulate volume before firing the request
    this.totalSessionVolume += payload.weight * payload.reps;

    const subject = new ReplaySubject<LogSetResponse>(1);
    this.pendingLogSet$ = subject;
    console.log("Obj: ",payload)
    this.http.post<LogSetResponse>(`${this.baseUrl}/logs/log-set`, payload).subscribe({
      next: (res) => subject.next(res),
      error: (err) => subject.error(err)
    });
    return subject;
  }

  completeWorkout(userId: number, totalWeight: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/workout/completeWorkout?userId=${userId}&totalWeight=${totalWeight}`,
      {}
    );
  }

  clearSession() {
    this.activeSession = null;
    this.activeExercises = [];
    this.exerciseIndex = 0;
    this.dayNumber = 0;
    this.pendingLogSet$ = null;
    this.totalSessionVolume = 0;
  }
}
