import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-arcus-warmup',
  templateUrl: './arcus-warmup-component.html',
  styleUrls: ['./arcus-warmup-component.scss'],
  imports: [CommonModule]
})
export class ArcusWarmupComponent {

  constructor(private router: Router) {}

  warmups = [
    {
      name: "Arm Circles",
      duration: "30 sec",
      description: "Loosen shoulder joints before pressing movements.",
      video: "/videos/warmup/arms_circles.mp4"
    },
    {
      name: "Push Ups",
      duration: "10 reps",
      description: "Activate chest and triceps.",
      video: "/videos/warmup/pushups.mp4"
    },
    {
      name: "Resistance Band Pull",
      duration: "15 reps",
      description: "With light weights, warm up the upper back and stabilize shoulders.",
      video: "/videos/warmup/lat_pulldown.mp4"
    }
  ];

  skipWarmup() {
    this.router.navigate(['/workout']);
  }

  startWorkout() {
    this.router.navigate(['/workout']);
  }
}