import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rest-screen',
  templateUrl: './rest-screen-component.html',
  styleUrls: ['./rest-screen-component.scss']
})
export class RestScreenComponent implements OnInit {

  remainingSeconds: number = 0;

  minutes: string = '00';
  seconds: string = '00';

  timer: any;

  restData: any;
  completedSet!: number;
  nextSet: any;


  constructor(private router: Router) {}

  
  ngOnInit(): void {

    const state = history.state;

    this.restData = state.restData;
    this.completedSet = state.completedSet;
    this.nextSet = state.nextSet;

    if (this.restData?.suggestedRestSeconds) {
      this.remainingSeconds = this.restData.suggestedRestSeconds;
    }

    this.updateTimeDisplay();
    this.startTimer();
  }

  startTimer() {

    console.log('Starting rest timer for', this.remainingSeconds, 'seconds');

    this.timer = setInterval(() => {

      this.remainingSeconds--;

      this.updateTimeDisplay();

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timer);
        this.endRest();
      }

    }, 1000);
  }

  updateTimeDisplay() {

    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;

    this.minutes = String(m).padStart(2, '0');
    this.seconds = String(s).padStart(2, '0');
  }

  endRest() {
    clearInterval(this.timer);
    this.router.navigate(['/workout'], {
      state: {
        completedSet: this.completedSet
      }
    });
  }
}