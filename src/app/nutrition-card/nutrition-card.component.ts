import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NutritionService } from '../services/nutrition.service';
import { NutritionInsight, NutritionTarget } from '../models/nutrition.model';

@Component({
  selector: 'app-nutrition-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nutrition-card.component.html',
  styleUrls: ['./nutrition-card.component.scss']
})
export class NutritionCardComponent implements OnInit {
  @Input() userId!: number;
  @Output() quickOptions = new EventEmitter<void>();

  target: NutritionTarget | null = null;
  insight: NutritionInsight | null = null;
  loading = true;
  showInfo = false;

  readonly insightIcon: Record<string, string> = {
    INFO:    '💡',
    WARNING: '⚠️',
    SUCCESS: '✅',
  };

  constructor(private nutritionService: NutritionService) {}

  ngOnInit() {
    this.nutritionService.getTarget(this.userId).subscribe(t => {
      this.loading = false;
      this.target = t;
    });

    // Pick one random insight from the list
    this.nutritionService.getInsights(this.userId).subscribe(list => {
      if (list.length) {
        this.insight = list[Math.floor(Math.random() * list.length)];
      }
    });
  }
}
