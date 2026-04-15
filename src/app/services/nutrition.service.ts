import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  NutritionTarget,
  NutritionInsight,
  PostWorkoutNutrition,
  QuickNutritionOption
} from '../models/nutrition.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NutritionService {

  private baseUrl = `${environment.apiBaseUrl}/nutrition`;

  constructor(private http: HttpClient) {}

  getTarget(userId: number): Observable<NutritionTarget | null> {
    return this.http.get<NutritionTarget>(`${this.baseUrl}/target?userId=${userId}`).pipe(
      catchError(() => of(null))
    );
  }

  // Returns NutritionInsightDTO[] directly
  getInsights(userId: number): Observable<NutritionInsight[]> {
    return this.http.get<NutritionInsight[]>(`${this.baseUrl}/insights?userId=${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  getPostWorkout(workoutSessionId: number): Observable<PostWorkoutNutrition | null> {
    return this.http.get<PostWorkoutNutrition>(
      `${this.baseUrl}/post-workout?workoutSessionId=${workoutSessionId}`
    ).pipe(
      catchError(() => of(null))
    );
  }

  getQuickOptions(userId: number): Observable<QuickNutritionOption[]> {
    return this.http.get<QuickNutritionOption[]>(`${this.baseUrl}/quick-options?userId=${userId}`).pipe(
      catchError(() => of([]))
    );
  }
}
