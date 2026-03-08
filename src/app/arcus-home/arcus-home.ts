import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-arcus-home',
  standalone: true,
  templateUrl: './arcus-home.html',
  styleUrls: ['./arcus-home.scss']
})
export class ArcusHomeComponent {

  @ViewChild('sliderThumb') sliderThumb!: ElementRef;
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;

  constructor(private router: Router) {}

  dragging = false;
  startX = 0;
  currentX = 0;

  todaysWorkout = {
    name: 'Push Day',
    muscles: 'Chest • Triceps • Shoulders'
  };

  lastWorkout = {
    name: 'Pull Day',
    volume: 7820,
    calories: 412,
    duration: 58
  };

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.dragging = true;
    this.startX = this.getPosition(event);
  }

  onDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (!this.dragging) return;

    const containerWidth =
      this.sliderContainer.nativeElement.offsetWidth - 60;

    const moveX = this.getPosition(event) - this.startX;

    this.currentX = Math.max(0, Math.min(moveX, containerWidth));

    this.sliderThumb.nativeElement.style.transform =
      `translateX(${this.currentX}px)`;
  }

  endDrag(event?: MouseEvent | TouchEvent) {
    if (event) event.preventDefault();
    this.dragging = false;

    const containerWidth =
      this.sliderContainer.nativeElement.offsetWidth - 60;

    if (this.currentX > containerWidth * 0.8) {
      this.startWorkout();
    }

    this.sliderThumb.nativeElement.style.transform = `translateX(0px)`;
    this.currentX = 0;
  }

  startWorkout() {
    this.router.navigate(['/warmup']);
    // alert('Workout Started 💪');
  }

  getPosition(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent
      ? event.clientX
      : event.touches[0].clientX;
  }
}