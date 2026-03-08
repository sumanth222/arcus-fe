import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user-profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseUrl = 'http://localhost:8080/user/profile';

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number): Observable<UserProfile> {

    return this.http.get<UserProfile>(`${this.baseUrl}/${userId}`);

  }

}