import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NutritionService } from '../services/nutrition.service';
import { QuickNutritionOption } from '../models/nutrition.model';

@Component({
  selector: 'app-quick-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-options.component.html',
  styleUrls: ['./quick-options.component.scss']
})
export class QuickOptionsComponent implements OnInit {
  @Input() userId!: number;
  @Output() close = new EventEmitter<void>();

  combos: QuickNutritionOption[] = [];
  expandedIndex: number | null = null;
  loading = true;

  constructor(private nutritionService: NutritionService) {}

  ngOnInit() {
    this.nutritionService.getQuickOptions(this.userId).subscribe(res => {
      this.combos = res ?? [];
      this.loading = false;
    });
  }

  toggle(i: number) {
    this.expandedIndex = this.expandedIndex === i ? null : i;
  }
}
