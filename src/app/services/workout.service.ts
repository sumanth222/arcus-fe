import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { ExerciseView, WorkoutSession } from '../models/workout.model';

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
