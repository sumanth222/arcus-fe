import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NextWorkoutInfo, UserProfile } from '../models/user-profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseUrl = 'http://localhost:8080/user/profile';
  private workoutBaseUrl = 'http://localhost:8080/workout';

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${userId}`);
  }

  getNextWorkoutInfo(userId: number, level: string): Observable<NextWorkoutInfo> {
    return this.http.get<NextWorkoutInfo>(
      `${this.workoutBaseUrl}/nextWorkoutName?userId=${userId}&level=${level}`
    );
  }

  createProfile(payload: {
    username: string;
    name: string;
    email: string;
    currentLevel: string;
    fitnessGoal: string;
    workoutSplit: string;
    lastWorkoutDay: number;
  }): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/create`, payload);
  }

  updateLastWorkoutDay(userId: number, lastWorkoutDay: number): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      `${this.baseUrl}/${userId}`,
      null,
      { params: { lastWorkoutDay: lastWorkoutDay } }
    );
  }
}