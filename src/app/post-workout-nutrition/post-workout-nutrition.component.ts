import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NutritionService } from '../services/nutrition.service';
import { PostWorkoutNutrition } from '../models/nutrition.model';

@Component({
  selector: 'app-post-workout-nutrition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-workout-nutrition.component.html',
  styleUrls: ['./post-workout-nutrition.component.scss']
})
export class PostWorkoutNutritionComponent implements OnInit {
  @Input() workoutSessionId!: number;

  data: PostWorkoutNutrition | null = null;
  loading = true;

  // Map carb level to a human-readable label + colour token
  readonly carbMeta: Record<string, { label: string; color: string }> = {
    LOW:    { label: 'Low carbs',    color: '#f87171' },
    MEDIUM: { label: 'Moderate carbs', color: '#fbbf24' },
    HIGH:   { label: 'High carbs',   color: '#86efac' },
  };

  get carb() {
    return this.data ? (this.carbMeta[this.data.carbLevel] ?? this.carbMeta['MEDIUM']) : null;
  }

  constructor(private nutritionService: NutritionService) {}

  ngOnInit() {
    this.nutritionService.getPostWorkout(this.workoutSessionId).subscribe(res => {
      // Only show card if the API returned real data
      this.data = (res && res.proteinRecommendation > 0) ? res : null;
      this.loading = false;
    });
  }
}
