import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-assessment-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-review.html',
  styleUrls: ['./assessment-review.scss']
})
export class AssessmentReviewComponent implements OnInit {

  userName = '';
  animIn = false;

  whileWaiting = [
    { icon: '💪', label: 'Track your workouts' },
    { icon: '🤖', label: 'Use Arcus AI Coach' },
    { icon: '🥗', label: 'Explore nutrition guidance' },
    { icon: '📈', label: 'Log your progress' },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.userName = this.authService.userName || 'Athlete';
    setTimeout(() => { this.animIn = true; }, 80);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
