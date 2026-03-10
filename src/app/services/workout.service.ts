import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  logSet(payload: { exerciseSessionId: number; setNumber: number; weight: number; reps: number }): Observable<LogSetResponse> {
    return this.http.post<LogSetResponse>(`${this.baseUrl}/logs/log-set`, payload);
  }

  generateWorkout(userId: number, level: string): Observable<WorkoutSession> {
    if (this.activeSession) {
      return of(this.activeSession);
    }
    return this.http.get<WorkoutSession>(
      `${this.baseUrl}/workout/generateWorkout?userId=${userId}&level=${level}`
    ).pipe(
      tap(session => this.activeSession = session)
    );
  }

  clearSession() {
    this.activeSession = null;
    this.activeExercises = [];
    this.exerciseIndex = 0;
  }
}
