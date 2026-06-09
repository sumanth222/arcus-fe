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

  leaving = false;

  benefits = [
    {
      icon: '🎯',
      title: 'Personalized workout programs',
      desc: 'Custom plans built around your goals, experience, and schedule — not a generic template.'
    },
    {
      icon: '📈',
      title: 'Smart progress tracking',
      desc: 'Arcus tracks every set and auto-adjusts your weights so you progress every single week.'
    },
    {
      icon: '🥗',
      title: 'Nutrition guidance',
      desc: 'Daily targets and meal logging tailored to your body and training load.'
    },
    {
      icon: '🤖',
      title: 'AI fitness coach',
      desc: 'Ask anything — form cues, alternatives, recovery tips — available 24/7.'
    }
  ];

  trustItems = [
    { icon: '🎯', label: 'Personalized programs' },
    { icon: '📈', label: 'Smart progress tracking' },
    { icon: '🥗', label: 'Nutrition guidance' },
    { icon: '🤖', label: 'AI fitness coach' },
  ];

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

  /** Primary CTA — lands on register tab */
  createAccount() {
    this.leaving = true;
    setTimeout(() => {
      this.router.navigate(['/login'], { queryParams: { mode: 'register' } });
    }, 480);
  }

  /** Secondary CTA — lands on sign-in tab */
  signIn() {
    this.leaving = true;
    setTimeout(() => {
      this.router.navigate(['/login'], { queryParams: { mode: 'login' } });
    }, 480);
  }
}
