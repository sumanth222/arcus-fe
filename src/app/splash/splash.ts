import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.html',
  styleUrls: ['./splash.scss']
})
export class SplashComponent implements OnInit, OnDestroy {

  entered = false;      // true after user taps "Get Started"
  leaving = false;      // triggers exit animation before nav

  pillRows = [
    [
      { icon: '🔥', text: '12-day streak' },
      { icon: '⚡', text: 'Day 4 · PPL' },
      { icon: '💪', text: '142 kg volume' },
      { icon: '↑',  text: '8.4% stronger' },
    ],
    [
      { icon: '🥗', text: '148 g protein' },
      { icon: '✓',  text: '4 sets logged' },
      { icon: '📈', text: 'New PR today' },
      { icon: '🎯', text: 'Goal on track' },
    ]
  ];

  constructor(private router: Router) {}

  ngOnInit() {}
  ngOnDestroy() {}

  getStarted() {
    this.leaving = true;
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 550);
  }
}
