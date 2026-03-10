import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-complete',
  templateUrl: './workout-complete-component.html',
  styleUrls: ['./workout-complete-component.scss']
})
export class WorkoutCompleteComponent {

  totalSets = 15;
  totalWeight = 2670;
  duration = 32;

  constructor(private router: Router) {}

  goHome() {

    this.router.navigate(['/home']);

  }
}